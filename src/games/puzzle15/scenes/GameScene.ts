import * as Phaser from 'phaser'

import { GameHud } from '../../../shared/GameHud.ts'
import { Sayac } from '../../../shared/Sayac.ts'
import { ScoreRecorder } from '../../../shared/ScoreRecorder.ts'
import { SwipeInput } from '../../../shared/SwipeInput.ts'
import { setChip } from '../../../shared/dom.ts'
import {
  BOARD_PADDING,
  BOARD_RADIUS,
  COLORS,
  FONT_FAMILY,
  GAME_HEIGHT,
  GAME_WIDTH,
  GRID_SIZE,
  SLIDE_DURATION,
  SWIPE_TARGET_ID,
  TILE_FONT_SIZE,
  TILE_GAP,
  TILE_RADIUS,
  TILE_SIZE,
  WIN_POP_DURATION,
  WIN_POP_SCALE,
  skorHesapla,
} from '../config/constants.ts'
import { SlidingPuzzle, type Yon } from '../systems/SlidingPuzzle.ts'

const CAPTURED_KEYS = ['LEFT', 'RIGHT', 'UP', 'DOWN']

const KEY_BINDINGS: Record<string, Yon> = {
  'keydown-LEFT': 'left',
  'keydown-RIGHT': 'right',
  'keydown-UP': 'up',
  'keydown-DOWN': 'down',
}

export class GameScene extends Phaser.Scene {
  private readonly puzzle = new SlidingPuzzle()
  private readonly sayac = new Sayac()
  private readonly views: Phaser.GameObjects.Container[] = []

  private hud!: GameHud
  private recorder!: ScoreRecorder
  private swipe?: SwipeInput
  private busy = false
  private bitti = false

  constructor() {
    super('Puzzle15')
  }

  create(): void {
    this.drawBoard()
    this.createTiles()

    this.hud = new GameHud({ onRestart: () => this.startNewGame() })
    this.hud.setScore(0)
    this.recorder = new ScoreRecorder('puzzle15', this.hud, (typing) => this.setTyping(typing))

    this.bindKeyboard()
    this.swipe = new SwipeInput(
      document.getElementById(SWIPE_TARGET_ID) ?? this.game.canvas,
      (yon) => this.oyna(() => this.puzzle.yonleOyna(yon)),
    )
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.swipe?.destroy())

    // Süre rozetini saniyede bir tazele.
    this.time.addEvent({ delay: 250, loop: true, callback: () => this.tazeleSure() })
    this.render()
  }

  // --- Kurulum ---

  private drawBoard(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(BOARD_RADIUS)
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        this.add.rectangle(this.x(col), this.y(row), TILE_SIZE, TILE_SIZE, COLORS.EMPTY).setRounded(TILE_RADIUS)
      }
    }
  }

  /** Taş sayısı sabit; görünümleri bir kez kurup her hamlede yerlerini güncelliyoruz. */
  private createTiles(): void {
    for (let value = 1; value < this.puzzle.toplamHucre; value++) {
      const rect = this.add.rectangle(0, 0, TILE_SIZE, TILE_SIZE, COLORS.TILE).setRounded(TILE_RADIUS)
      const label = this.add
        .text(0, 0, String(value), {
          fontFamily: FONT_FAMILY,
          fontSize: `${TILE_FONT_SIZE}px`,
          fontStyle: 'bold',
          color: COLORS.TEXT,
        })
        .setOrigin(0.5)

      const container = this.add.container(0, 0, [rect, label])
      container.setSize(TILE_SIZE, TILE_SIZE)
      container.setInteractive(
        new Phaser.Geom.Rectangle(-TILE_SIZE / 2, -TILE_SIZE / 2, TILE_SIZE, TILE_SIZE),
        Phaser.Geom.Rectangle.Contains,
      )
      container.on('pointerdown', () => this.oyna(() => this.puzzle.oyna(this.puzzle.tiles.indexOf(value))))
      this.views.push(container)
    }
  }

  private bindKeyboard(): void {
    const keyboard = this.input.keyboard
    if (!keyboard) return
    for (const [event, yon] of Object.entries(KEY_BINDINGS)) {
      keyboard.on(event, () => this.oyna(() => this.puzzle.yonleOyna(yon)))
    }
    keyboard.addCapture(CAPTURED_KEYS)
  }

  private setTyping(typing: boolean): void {
    const keyboard = this.input.keyboard
    if (!keyboard) return
    keyboard.enabled = !typing
    if (typing) keyboard.removeCapture(CAPTURED_KEYS)
    else keyboard.addCapture(CAPTURED_KEYS)
  }

  // --- Oyun akışı ---

  private oyna(hamle: () => boolean): void {
    if (this.busy || this.bitti) return
    this.sayac.basla()
    if (!hamle()) return

    this.busy = true
    this.render(true)
    setChip('moves', this.puzzle.hamle)

    this.time.delayedCall(SLIDE_DURATION, () => {
      this.busy = false
      if (this.puzzle.cozuldu) this.kazandi()
    })
  }

  private kazandi(): void {
    this.bitti = true
    this.sayac.durdur()
    const score = skorHesapla(this.puzzle.hamle, this.sayac.saniye)
    this.hud.setScore(score)

    for (const [index, view] of this.views.entries()) {
      this.tweens.add({
        targets: view,
        scale: WIN_POP_SCALE,
        duration: WIN_POP_DURATION / 2,
        delay: index * 18,
        yoyo: true,
        ease: 'Quad.easeOut',
      })
    }

    const summary = `${this.puzzle.hamle} hamle · ${this.sayac.yazi} · Skor: ${score}`
    this.time.delayedCall(WIN_POP_DURATION + this.views.length * 18, () => {
      this.recorder.finish(score, {
        title: 'Sıraladın! 🎉',
        text: `${summary} — skor tablosuna girdin!`,
        onDone: () =>
          this.hud.showOverlay({
            title: 'Sıraladın! 🎉',
            text: summary,
            primaryLabel: 'Yeni oyun',
            onPrimary: () => this.startNewGame(),
          }),
      })
    })
  }

  private startNewGame(): void {
    this.hud.hideOverlay()
    this.tweens.killAll()
    this.puzzle.reset()
    this.sayac.sifirla()
    this.busy = false
    this.bitti = false
    this.hud.setScore(0)
    setChip('moves', 0)
    setChip('timer', '0:00')
    this.render()
  }

  // --- Görünüm ---

  private render(animasyonlu = false): void {
    for (let index = 0; index < this.puzzle.tiles.length; index++) {
      const value = this.puzzle.tiles[index]
      if (value === 0) continue

      const view = this.views[value - 1]
      const { row, col } = this.puzzle.konum(index)
      const x = this.x(col)
      const y = this.y(row)
      const rect = view.first as Phaser.GameObjects.Rectangle
      rect.setFillStyle(this.puzzle.yerindeMi(index) ? COLORS.TILE_HOME : COLORS.TILE)

      if (animasyonlu && (view.x !== x || view.y !== y)) {
        this.tweens.add({ targets: view, x, y, duration: SLIDE_DURATION, ease: 'Quad.easeOut' })
      } else if (!animasyonlu) {
        view.setPosition(x, y)
      }
    }
  }

  private tazeleSure(): void {
    if (!this.bitti) setChip('timer', this.sayac.yazi)
  }

  private x(col: number): number {
    return BOARD_PADDING + col * (TILE_SIZE + TILE_GAP) + TILE_SIZE / 2
  }

  private y(row: number): number {
    return BOARD_PADDING + row * (TILE_SIZE + TILE_GAP) + TILE_SIZE / 2
  }
}
