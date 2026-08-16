/**
 * Wordle mantığı. Harf durumları klasik kurala göre hesaplanır:
 * önce doğru yerdekiler işaretlenir, kalan harfler sayılarak "var" verilir.
 * Böylece tekrar eden harfler fazladan sarı boyanmaz.
 */

import { birSec, type Uretec } from '../../../shared/rastgele.ts'
import { KELIMELER } from '../../../shared/kelimeler.ts'
import { HARF_SAYISI, MAX_DENEME } from '../config/constants.ts'

export type HarfDurumu = 'dogru' | 'var' | 'yok'
export type Durum = 'oynaniyor' | 'kazandi' | 'kaybetti'

export interface Deneme {
  kelime: string
  durumlar: HarfDurumu[]
}

/** Sözlükten beş harfli kelimeler. */
export function besHarfliler(): string[] {
  return [...new Set(KELIMELER.map((k) => k.kelime).filter((k) => k.length === HARF_SAYISI))]
}

export function degerlendir(gizli: string, tahmin: string): HarfDurumu[] {
  const durumlar: HarfDurumu[] = Array(tahmin.length).fill('yok')
  const kalan = new Map<string, number>()

  for (let i = 0; i < gizli.length; i++) {
    if (tahmin[i] === gizli[i]) durumlar[i] = 'dogru'
    else kalan.set(gizli[i], (kalan.get(gizli[i]) ?? 0) + 1)
  }

  for (let i = 0; i < tahmin.length; i++) {
    if (durumlar[i] === 'dogru') continue
    const adet = kalan.get(tahmin[i]) ?? 0
    if (adet > 0) {
      durumlar[i] = 'var'
      kalan.set(tahmin[i], adet - 1)
    }
  }
  return durumlar
}

export class WordleGame {
  gizli = ''
  denemeler: Deneme[] = []
  taslak = ''
  durum: Durum = 'oynaniyor'

  private readonly random: Uretec

  constructor(random: Uretec = Math.random) {
    this.random = random
    this.reset()
  }

  get kalanHak(): number {
    return MAX_DENEME - this.denemeler.length
  }

  get bitti(): boolean {
    return this.durum !== 'oynaniyor'
  }

  /** Klavyede bir harfin bugüne kadarki en iyi durumu. */
  get harfDurumlari(): Map<string, HarfDurumu> {
    const oncelik: Record<HarfDurumu, number> = { yok: 0, var: 1, dogru: 2 }
    const sonuc = new Map<string, HarfDurumu>()
    for (const deneme of this.denemeler) {
      ;[...deneme.kelime].forEach((harf, i) => {
        const yeni = deneme.durumlar[i]
        const eski = sonuc.get(harf)
        if (!eski || oncelik[yeni] > oncelik[eski]) sonuc.set(harf, yeni)
      })
    }
    return sonuc
  }

  reset(): void {
    this.gizli = birSec(besHarfliler(), this.random)
    this.denemeler = []
    this.taslak = ''
    this.durum = 'oynaniyor'
  }

  harfEkle(harf: string): boolean {
    if (this.bitti || this.taslak.length >= HARF_SAYISI) return false
    this.taslak += harf
    return true
  }

  harfSil(): boolean {
    if (this.bitti || this.taslak.length === 0) return false
    this.taslak = this.taslak.slice(0, -1)
    return true
  }

  /** Taslağı dener. Eksikse null döner. */
  dene(): Deneme | null {
    if (this.bitti || this.taslak.length !== HARF_SAYISI) return null

    const deneme: Deneme = { kelime: this.taslak, durumlar: degerlendir(this.gizli, this.taslak) }
    this.denemeler.push(deneme)
    this.taslak = ''

    if (deneme.kelime === this.gizli) this.durum = 'kazandi'
    else if (this.denemeler.length >= MAX_DENEME) this.durum = 'kaybetti'
    return deneme
  }
}
