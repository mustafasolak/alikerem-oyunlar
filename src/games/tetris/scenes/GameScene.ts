import * as Phaser from 'phaser'

import { GameHud } from '../../../shared/GameHud.ts'
import { ScoreRecorder } from '../../../shared/ScoreRecorder.ts'
import { SwipeInput } from '../../../shared/SwipeInput.ts'
import { setChip } from '../../../shared/dom.ts'
import {
  BLOCK_INSET,
  BLOCK_RADIUS,
  BOARD_H,
  BOARD_RADIUS,
  BOARD_W,
  BOARD_X,
  BOARD_Y,
  CELL,
  COLORS,
  COLS,
  FONT_FAMILY,
  KILIT_GECIKMESI_MS,
  MAX_CATCH_UP_MS,
  PANEL_FONT_SIZE,
  PANEL_W,
  PANEL_X,
  ROWS,
  SATIR_TEMIZLEME_MS,
  SWIPE_TARGET_ID,
  TAS_RENKLERI,
  TAS_SEKILLERI,
  dusmeAraligi,
} from '../config/constants.ts'
import { TetrisGame } from '../systems/TetrisGame.ts'

const CAPTURED_KEYS = ['LEFT', 'RIGHT', 'UP', 'DOWN', 'SPACE']

export class GameScene extends Phaser.Scene {
  private readonly oyun = new TetrisGame()

  private hud!: GameHud
  private recorder!: ScoreRecorder
  private swipe?: SwipeInput
  private blokKatmani!: Phaser.GameObjects.Container
  private onizlemeKatmani!: Phaser.GameObjects.Container

  private birikim = 0
  /** Taş yere değdiğinden beri geçen süre; hemen kilitlemeyip oynama payı bırakıyoruz. */
  private kilitBekleme = 0
  private kilitleniyor = false

  constructor() {
    super('Tetris')
  }

  create(): void {
    this.drawBoard()
    this.blokKatmani = this.add.container(0, 0)
    this.onizlemeKatmani = this.add.container(0, 0)

    this.hud = new GameHud({ onRestart: () => this.startNewGame() })
    this.hud.setScore(0)
    this.recorder = new ScoreRecorder('tetris', this.hud, (typing) => this.setTyping(typing))

    this.bindKeyboard()
    this.bindPad()
    this.swipe = new SwipeInput(document.getElementById(SWIPE_TARGET_ID) ?? this.game.canvas, (yon) => {
      if (yon === 'left') this.komut('left')
      else if (yon === 'right') this.komut('right')
      else if (yon === 'down') this.komut('drop')
      else this.komut('rotate')
    })
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.swipe?.destroy())

    this.render()
  }

  update(_time: number, delta: number): void {
    if (this.oyun.durum !== 'oynaniyor' || this.kilitleniyor) return

    if (this.oyun.yereDegdi) {
      // Yere değdi: kısa bir süre kaydırma/çevirme şansı ver, sonra kilitle.
      this.kilitBekleme += delta
      if (this.kilitBekleme >= KILIT_GECIKMESI_MS) this.tasiKilitle()
      return
    }

    this.kilitBekleme = 0
    this.birikim = Math.min(this.birikim + delta, MAX_CATCH_UP_MS)
    const aralik = dusmeAraligi(this.oyun.seviye)

    while (this.birikim >= aralik && this.oyun.durum === 'oynaniyor' && !this.oyun.yereDegdi) {
      this.birikim -= aralik
      this.oyun.indir()
    }
    this.render()
  }

  // --- Kurulum ---

  private drawBoard(): void {
    this.add
      .rectangle(BOARD_X + BOARD_W / 2, BOARD_Y + BOARD_H / 2, BOARD_W, BOARD_H, COLORS.BOARD)
      .setRounded(BOARD_RADIUS)

    const izgara = this.add.graphics()
    izgara.lineStyle(1, COLORS.IZGARA, 0.7)
    for (let c = 1; c < COLS; c++) {
      const x = BOARD_X + c * CELL
      izgara.lineBetween(x, BOARD_Y, x, BOARD_Y + BOARD_H)
    }
    for (let r = 1; r < ROWS; r++) {
      const y = BOARD_Y + r * CELL
      izgara.lineBetween(BOARD_X, y, BOARD_X + BOARD_W, y)
    }

    this.add
      .rectangle(PANEL_X + PANEL_W / 2, BOARD_Y + PANEL_W / 2 + 18, PANEL_W, PANEL_W + 36, COLORS.PANEL)
      .setRounded(BOARD_RADIUS)
    this.add
      .text(PANEL_X + PANEL_W / 2, BOARD_Y + 16, 'SIRADAKİ', {
        fontFamily: FONT_FAMILY,
        fontSize: `${PANEL_FONT_SIZE}px`,
        fontStyle: 'bold',
        color: COLORS.YAZI,
      })
      .setOrigin(0.5)
  }

  private bindKeyboard(): void {
    const keyboard = this.input.keyboard
    if (!keyboard) return
    keyboard.on('keydown-LEFT', () => this.komut('left'))
    keyboard.on('keydown-A', () => this.komut('left'))
    keyboard.on('keydown-RIGHT', () => this.komut('right'))
    keyboard.on('keydown-D', () => this.komut('right'))
    keyboard.on('keydown-UP', () => this.komut('rotate'))
    keyboard.on('keydown-W', () => this.komut('rotate'))
    keyboard.on('keydown-X', () => this.komut('rotate'))
    keyboard.on('keydown-DOWN', () => this.komut('soft'))
    keyboard.on('keydown-S', () => this.komut('soft'))
    keyboard.on('keydown-SPACE', () => this.komut('drop'))
    keyboard.on('keydown-P', () => this.duraklat())
    keyboard.on('keydown-ESC', () => this.duraklat())
    keyboard.addCapture(CAPTURED_KEYS)
  }

  /** Mobil için sayfadaki yön tuşları. */
  private bindPad(): void {
    const pad = document.getElementById('pad')
    if (!pad) return
    for (const button of pad.querySelectorAll<HTMLButtonElement>('button[data-move]')) {
      button.addEventListener('click', () => this.komut(button.dataset.move ?? ''))
    }
  }

  private setTyping(typing: boolean): void {
    const keyboard = this.input.keyboard
    if (!keyboard) return
    keyboard.enabled = !typing
    if (typing) keyboard.removeCapture(CAPTURED_KEYS)
    else keyboard.addCapture(CAPTURED_KEYS)
  }

  // --- Oyun akışı ---

  private komut(hangi: string): void {
    if (this.oyun.durum !== 'oynaniyor' || this.kilitleniyor) return

    if (hangi === 'left') this.oyun.kaydir(-1)
    else if (hangi === 'right') this.oyun.kaydir(1)
    else if (hangi === 'rotate') this.oyun.cevirmeyiDene()
    else if (hangi === 'soft') this.oyun.indir(true)
    else if (hangi === 'drop') {
      this.kilitSonucu(this.oyun.sertDusur())
      return
    }
    this.render()
    this.hud.setScore(this.oyun.skor)
  }

  private tasiKilitle(): void {
    this.kilitBekleme = 0
    this.kilitSonucu(this.oyun.kilitle())
  }

  private kilitSonucu(sonuc: ReturnType<TetrisGame['kilitle']>): void {
    if (!sonuc.kilitlendi) return
    this.birikim = 0
    this.kilitBekleme = 0
    this.hud.setScore(this.oyun.skor)
    setChip('level', this.oyun.seviye)
    setChip('lines', this.oyun.satirSayisi)

    if (sonuc.temizlenen.length > 0) {
      this.kilitleniyor = true
      this.hud.showGain((sonuc.temizlenen.length === 4 ? 800 : sonuc.temizlenen.length * 100) * this.oyun.seviye)
      this.cameras.main.flash(SATIR_TEMIZLEME_MS, 40, 70, 90)
      this.time.delayedCall(SATIR_TEMIZLEME_MS, () => {
        this.kilitleniyor = false
        this.render()
        if (sonuc.bitti) this.oyunBitti()
      })
      this.render()
      return
    }

    this.render()
    if (sonuc.bitti) this.oyunBitti()
  }

  private duraklat(): void {
    if (this.oyun.bitti) return
    this.oyun.duraklat()
    if (this.oyun.durum === 'durakladi') {
      this.hud.showOverlay({
        title: 'Duraklatıldı',
        text: 'Kaldığın yerden devam edebilirsin.',
        primaryLabel: 'Devam et',
        onPrimary: () => {
          this.oyun.duraklat()
          this.hud.hideOverlay()
          this.birikim = 0
        },
        secondaryLabel: 'Yeni oyun',
        onSecondary: () => this.startNewGame(),
      })
    } else {
      this.hud.hideOverlay()
      this.birikim = 0
    }
  }

  private oyunBitti(): void {
    const score = this.oyun.skor
    const ozet = `Seviye ${this.oyun.seviye} · ${this.oyun.satirSayisi} satır · Skor: ${score}`
    this.cameras.main.shake(220, 0.012)

    this.time.delayedCall(340, () => {
      this.recorder.finish(score, {
        title: 'Oyun bitti',
        text: `${ozet} — skor tablosuna girdin!`,
        onDone: () =>
          this.hud.showOverlay({
            title: 'Oyun bitti',
            text: ozet,
            primaryLabel: 'Tekrar dene',
            onPrimary: () => this.startNewGame(),
          }),
      })
    })
  }

  private startNewGame(): void {
    this.hud.hideOverlay()
    this.time.removeAllEvents()
    this.oyun.reset()
    this.birikim = 0
    this.kilitBekleme = 0
    this.kilitleniyor = false
    this.hud.setScore(0)
    setChip('level', 1)
    setChip('lines', 0)
    this.render()
  }

  // --- Görünüm ---

  private render(): void {
    this.blokKatmani.removeAll(true)

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const hucre = this.oyun.tahta[r][c]
        if (hucre) this.blok(BOARD_X + c * CELL, BOARD_Y + r * CELL, TAS_RENKLERI[hucre])
      }
    }

    const aktif = this.oyun.aktif
    if (aktif) {
      // Hayalet: taşın nereye düşeceğini gösterir.
      const hayalet = this.oyun.hayaletSatir
      if (hayalet !== aktif.satir) {
        for (const { satir, sutun } of this.oyun.dolular(aktif.matris, hayalet, aktif.sutun)) {
          if (satir >= 0) this.blok(BOARD_X + sutun * CELL, BOARD_Y + satir * CELL, COLORS.HAYALET, 0.55)
        }
      }
      for (const { satir, sutun } of this.oyun.dolular(aktif.matris, aktif.satir, aktif.sutun)) {
        if (satir >= 0) this.blok(BOARD_X + sutun * CELL, BOARD_Y + satir * CELL, TAS_RENKLERI[aktif.tip])
      }
    }

    this.renderOnizleme()
  }

  private renderOnizleme(): void {
    this.onizlemeKatmani.removeAll(true)
    const matris = TAS_SEKILLERI[this.oyun.siradaki]
    const boyut = 20
    const genislik = matris[0].length * boyut
    const yukseklik = matris.length * boyut
    const x0 = PANEL_X + (PANEL_W - genislik) / 2
    const y0 = BOARD_Y + 34 + (PANEL_W - yukseklik) / 2

    for (let r = 0; r < matris.length; r++) {
      for (let c = 0; c < matris[r].length; c++) {
        if (!matris[r][c]) continue
        const blok = this.add
          .rectangle(
            x0 + c * boyut + boyut / 2,
            y0 + r * boyut + boyut / 2,
            boyut - BLOCK_INSET,
            boyut - BLOCK_INSET,
            TAS_RENKLERI[this.oyun.siradaki],
          )
          .setRounded(3)
        this.onizlemeKatmani.add(blok)
      }
    }
  }

  private blok(x: number, y: number, renk: number, alpha = 1): void {
    const rect = this.add
      .rectangle(x + CELL / 2, y + CELL / 2, CELL - BLOCK_INSET, CELL - BLOCK_INSET, renk, alpha)
      .setRounded(BLOCK_RADIUS)
    this.blokKatmani.add(rect)
  }
}
