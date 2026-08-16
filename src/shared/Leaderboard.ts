/**
 * Oyun başına, bu cihazda tutulan isimli skor tablosu.
 * Sunucu yok: her şey localStorage'da, aynı tarayıcıda oynayan herkes içindir.
 * Aynı isimden yalnızca en iyi skor kalır, böylece tablo farklı kişileri gösterir.
 */

import { readJson, readScore, readString, writeJson, writeString } from './safeStorage.ts'

export interface ScoreEntry {
  name: string
  score: number
  /** Kayıt zamanı (ms). Eşit skorlarda önce gelen üstte kalır. */
  at: number
}

export const LEADERBOARD_SIZE = 5
export const MAX_NAME_LENGTH = 12
export const DEFAULT_NAME = 'Misafir'

/** Son kullanılan takma ad bütün oyunlarda ortak; tekrar yazdırmayalım. */
const NICK_KEY = 'oyunlar.nick'
const scoresKey = (gameId: string): string => `oyunlar.${gameId}.skorlar`
/** İsimli tablodan önce kullanılan sade "en iyi skor" anahtarı. */
const legacyBestKey = (gameId: string): string => `oyunlar.${gameId}.best`

/**
 * Skor kimliği sonradan katalog kimliğine çekilen oyunlar.
 * Cihazdaki eski kayıtlar kaybolmasın diye bir kez taşınır.
 * (2048'in klasörü `game2048`, skorları bir dönem `2048` altında tutulmuştu.)
 */
const ESKI_SKOR_KIMLIGI: Record<string, string> = { game2048: '2048' }

export function loadNick(): string {
  return readString(NICK_KEY) ?? ''
}

export function saveNick(name: string): void {
  writeString(NICK_KEY, name)
}

/** Boşlukları toparlar, uzunluğu sınırlar, boşsa varsayılan adı verir. */
export function cleanName(raw: string): string {
  const trimmed = raw.trim().replace(/\s+/g, ' ').slice(0, MAX_NAME_LENGTH)
  return trimmed || DEFAULT_NAME
}

const sameName = (a: string, b: string): boolean =>
  a.toLocaleLowerCase('tr') === b.toLocaleLowerCase('tr')

function sortEntries(entries: ScoreEntry[]): ScoreEntry[] {
  return entries.slice().sort((a, b) => b.score - a.score || a.at - b.at)
}

function toEntry(value: unknown): ScoreEntry | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>
  const score = Number(raw.score)
  if (typeof raw.name !== 'string' || !Number.isFinite(score) || score <= 0) return null
  const at = Number(raw.at)
  return { name: cleanName(raw.name), score, at: Number.isFinite(at) ? at : 0 }
}

export class Leaderboard {
  readonly gameId: string
  readonly size: number

  private list: ScoreEntry[]

  constructor(gameId: string, size: number = LEADERBOARD_SIZE) {
    this.gameId = gameId
    this.size = size
    this.list = this.read()
  }

  get entries(): ScoreEntry[] {
    return this.list.slice()
  }

  get best(): ScoreEntry | null {
    return this.list[0] ?? null
  }

  get bestScore(): number {
    return this.list[0]?.score ?? 0
  }

  /** Bu skor ilk N'e giriyor mu? */
  qualifies(score: number): boolean {
    if (score <= 0) return false
    if (this.list.length < this.size) return true
    return score > this.list[this.list.length - 1].score
  }

  /** Skoru kaydeder, kalan kaydı döner. Takma adı da hatırlar. */
  add(rawName: string, score: number): ScoreEntry {
    const name = cleanName(rawName)
    const previous = this.list.find((entry) => sameName(entry.name, name))
    const others = this.list.filter((entry) => !sameName(entry.name, name))
    // Aynı kişi daha iyisini yapmışsa eski kaydı koru.
    const kept: ScoreEntry =
      previous && previous.score >= score ? previous : { name, score, at: Date.now() }

    this.list = sortEntries([...others, kept]).slice(0, this.size)
    writeJson(scoresKey(this.gameId), this.list)
    saveNick(name)
    return kept
  }

  private read(): ScoreEntry[] {
    const kendi = this.readKey(this.gameId)
    if (kendi.length > 0) return kendi

    // Kimliği değişmiş oyunlarda eski anahtarı bir kez taşı
    const eski = ESKI_SKOR_KIMLIGI[this.gameId]
    if (eski) {
      const tasinan = this.readKey(eski)
      if (tasinan.length > 0) {
        writeJson(scoresKey(this.gameId), tasinan)
        return tasinan
      }
    }
    return this.migrateLegacyBest()
  }

  private readKey(gameId: string): ScoreEntry[] {
    const raw = readJson<unknown[]>(scoresKey(gameId))
    const parsed = Array.isArray(raw) ? raw.map(toEntry).filter((entry) => entry !== null) : []
    return parsed.length > 0 ? sortEntries(parsed).slice(0, this.size) : []
  }

  /** İsimsiz dönemden kalan en iyi skoru kaybetmeyelim; tabloya tek kayıt olarak al. */
  private migrateLegacyBest(): ScoreEntry[] {
    const eski = ESKI_SKOR_KIMLIGI[this.gameId]
    const legacy = Math.max(
      readScore(legacyBestKey(this.gameId)),
      eski ? readScore(legacyBestKey(eski)) : 0,
    )
    if (legacy <= 0) return []

    const seeded: ScoreEntry[] = [{ name: cleanName(loadNick()), score: legacy, at: 0 }]
    writeJson(scoresKey(this.gameId), seeded)
    return seeded
  }
}

/** Ana sayfa kartları için: oyunun tablo birincisi (yoksa null). */
export function bestEntryOf(gameId: string): ScoreEntry | null {
  return new Leaderboard(gameId).best
}
