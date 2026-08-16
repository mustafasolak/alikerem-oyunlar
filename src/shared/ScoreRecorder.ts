/**
 * Skor tablosu ile HUD'u birbirine bağlar: en iyi skoru yazar, tabloyu çizer,
 * tur bitince gerekiyorsa takma ad sorar.
 * Oyun sahneleri bunu kullanır, Leaderboard ile doğrudan uğraşmaz.
 */

import type { GameHud } from './GameHud.ts'
import { Leaderboard, loadNick } from './Leaderboard.ts'
import { sunucu, type Donem } from './Sunucu.ts'

export interface FinishOptions {
  title: string
  /** Ad sorulurken gösterilen açıklama. */
  text: string
  /** Kayıt yapıldıktan veya atlandıktan sonra çalışır. */
  onDone: () => void
  skipLabel?: string
  /** Tur süresi (saniye) — sunucu makul mü diye bakar. */
  sure?: number
}

export class ScoreRecorder {
  private readonly board: Leaderboard
  private readonly hud: GameHud
  /** Ad yazarken oyunun klavyeyi bırakmasını sağlar (WASD isme yazılabilsin). */
  private readonly setTyping: (typing: boolean) => void

  private readonly oyunId: string
  private kapsam: 'cihaz' | 'global' = 'cihaz'
  private donem: Donem = 'tum'

  constructor(gameId: string, hud: GameHud, setTyping: (typing: boolean) => void) {
    this.oyunId = gameId
    this.board = new Leaderboard(gameId)
    this.hud = hud
    this.setTyping = setTyping
    this.refresh()
    void this.sunucuyuDene()
  }

  /** Sunucu varsa Global sekmesini açar. Yoksa hiçbir şey değişmez. */
  private async sunucuyuDene(): Promise<void> {
    if (!(await sunucu.hazir())) return
    this.hud.tabloSekmeleriniAc((kapsam, donem) => {
      this.kapsam = kapsam
      this.donem = donem
      void this.tabloyuTazele()
    })
  }

  private async tabloyuTazele(): Promise<void> {
    if (this.kapsam === 'cihaz') {
      this.hud.tabloNotuYaz(null)
      this.refresh()
      return
    }
    this.hud.tabloNotuYaz('Yükleniyor…')
    const kayitlar = await sunucu.tablo(this.oyunId, this.donem)
    if (!kayitlar) {
      this.hud.tabloNotuYaz('Global tabloya şu an ulaşılamıyor.')
      return
    }
    this.hud.tabloNotuYaz(kayitlar.length === 0 ? 'Bu dönemde henüz kayıt yok.' : null)
    this.hud.globalTabloCiz(kayitlar)
  }

  qualifies(score: number): boolean {
    return this.board.qualifies(score)
  }

  /** En iyi skoru ve tabloyu HUD'a bas. */
  refresh(highlightAt?: number): void {
    if (this.kapsam === 'global') return
    const best = this.board.best
    this.hud.setBest(best?.score ?? 0, best?.name)
    this.hud.renderScoreboard(this.board.entries, highlightAt)
  }

  /**
   * Tur bitti. Skor ilk 5'e giriyorsa ad sorar, girmiyorsa doğrudan devam eder.
   * Her iki durumda da sonunda `onDone` çağrılır.
   */
  finish(score: number, options: FinishOptions): void {
    if (!this.board.qualifies(score)) {
      // Cihaz tablosuna girmese de global tabloya gitsin (ad biliniyorsa)
      const ad = loadNick()
      if (ad && score > 0) void sunucu.skorGonder(this.oyunId, score, ad, options.sure)
      options.onDone()
      return
    }

    this.setTyping(true)
    this.hud.showOverlay({
      title: options.title,
      text: options.text,
      prompt: {
        defaultName: loadNick(),
        submitLabel: 'Kaydet',
        onSubmit: (name) => {
          const saved = this.board.add(name, score)
          this.setTyping(false)
          this.refresh(saved.at)
          // Sunucuya gönderim ateşle-unut: başarısızlık oyunu etkilemez
          void sunucu.skorGonder(this.oyunId, score, saved.name, options.sure)
          options.onDone()
        },
      },
      primaryLabel: options.skipLabel ?? 'Adsız geç',
      onPrimary: () => {
        this.setTyping(false)
        options.onDone()
      },
    })
  }
}
