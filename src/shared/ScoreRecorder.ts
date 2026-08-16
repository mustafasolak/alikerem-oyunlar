/**
 * Skor tablosu ile HUD'u birbirine bağlar: en iyi skoru yazar, tabloyu çizer,
 * tur bitince gerekiyorsa takma ad sorar.
 * Oyun sahneleri bunu kullanır, Leaderboard ile doğrudan uğraşmaz.
 */

import type { GameHud } from './GameHud.ts'
import { Leaderboard, loadNick } from './Leaderboard.ts'

export interface FinishOptions {
  title: string
  /** Ad sorulurken gösterilen açıklama. */
  text: string
  /** Kayıt yapıldıktan veya atlandıktan sonra çalışır. */
  onDone: () => void
  skipLabel?: string
}

export class ScoreRecorder {
  private readonly board: Leaderboard
  private readonly hud: GameHud
  /** Ad yazarken oyunun klavyeyi bırakmasını sağlar (WASD isme yazılabilsin). */
  private readonly setTyping: (typing: boolean) => void

  constructor(gameId: string, hud: GameHud, setTyping: (typing: boolean) => void) {
    this.board = new Leaderboard(gameId)
    this.hud = hud
    this.setTyping = setTyping
    this.refresh()
  }

  qualifies(score: number): boolean {
    return this.board.qualifies(score)
  }

  /** En iyi skoru ve tabloyu HUD'a bas. */
  refresh(highlightAt?: number): void {
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
