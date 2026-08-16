import * as Phaser from 'phaser'

import { GameHud } from '../../../shared/GameHud.ts'
import { ScoreRecorder } from '../../../shared/ScoreRecorder.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { SwipeInput } from '../../../shared/SwipeInput.ts'
import {
  BOARD_PADDING,
  BOARD_RADIUS,
  CELL_SIZE,
  COLORS,
  DEATH_SHAKE_INTENSITY,
  DEATH_SHAKE_MS,
  EAT_POP_MS,
  EAT_POP_SCALE,
  EYE_FORWARD,
  EYE_RADIUS,
  EYE_SIDE,
  FONT_FAMILY,
  FOOD_PULSE_MS,
  FOOD_PULSE_SCALE,
  FOOD_RADIUS,
  GAME_HEIGHT,
  GAME_WIDTH,
  GRID_COLS,
  GRID_LINE_ALPHA,
  GRID_ROWS,
  MAX_CATCH_UP_MS,
  OVERLAY_DELAY_MS,
  READY_FONT_SIZE,
  SEGMENT_INSET,
  SEGMENT_RADIUS,
  SWIPE_TARGET_ID,
  lerpColor,
} from '../config/constants.ts'
import { DIRECTION_VECTORS, SnakeGame, type Cell, type Direction } from '../systems/SnakeGame.ts'

const KEY_BINDINGS: Record<string, Direction> = {
  'keydown-LEFT': 'left',
  'keydown-A': 'left',
  'keydown-RIGHT': 'right',
  'keydown-D': 'right',
  'keydown-UP': 'up',
  'keydown-W': 'up',
  'keydown-DOWN': 'down',
  'keydown-S': 'down',
}

const PAUSE_EVENTS = ['keydown-SPACE', 'keydown-ESC', 'keydown-P']

/** Sayfayı kaydırmasınlar diye tarayıcıdan alınan tuşlar. */
const CAPTURED_KEYS = ['LEFT', 'RIGHT', 'UP', 'DOWN', 'SPACE']

export class GameScene extends Phaser.Scene {
  private readonly snake = new SnakeGame()
  private readonly segmentViews: Phaser.GameObjects.Rectangle[] = []

  private hud!: GameHud
  private recorder!: ScoreRecorder
  private segmentLayer!: Phaser.GameObjects.Container
  private foodView!: Phaser.GameObjects.Arc
  private eyes: Phaser.GameObjects.Arc[] = []
  private readyLabel!: Phaser.GameObjects.Text
  private swipe?: SwipeInput

  /** Son adımdan bu yana biriken süre (ms). */
  private accumulator = 0

  constructor() {
    super('Yilan')
  }

  create(): void {
    this.drawBoard()

    this.foodView = this.add.circle(0, 0, FOOD_RADIUS, COLORS.FOOD)
    this.tweens.add({
      targets: this.foodView,
      scale: FOOD_PULSE_SCALE,
      duration: FOOD_PULSE_MS,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    this.segmentLayer = this.add.container(0, 0)
    this.eyes = [this.add.circle(0, 0, EYE_RADIUS, COLORS.EYE), this.add.circle(0, 0, EYE_RADIUS, COLORS.EYE)]

    this.readyLabel = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.28, 'Başlamak için yön tuşuna bas\nveya parmağını kaydır', {
        fontFamily: FONT_FAMILY,
        fontSize: `${READY_FONT_SIZE}px`,
        color: COLORS.READY_TEXT,
        align: 'center',
      })
      .setOrigin(0.5)

    this.hud = new GameHud({ onRestart: () => this.startNewGame() })
    this.hud.setScore(0)
    this.recorder = new ScoreRecorder('yilan', this.hud, (typing) => this.setTyping(typing))

    this.bindKeyboard()
    this.bindSwipe()
    this.render()
  }

  update(_time: number, delta: number): void {
    if (this.snake.status !== 'playing') return

    // Sekme arka planda kaldıysa biriken süreyi sınırla, yılan birden fırlamasın.
    this.accumulator = Math.min(this.accumulator + delta, MAX_CATCH_UP_MS)

    while (this.snake.status === 'playing' && this.accumulator >= this.snake.stepInterval) {
      this.accumulator -= this.snake.stepInterval
      this.advance()
    }
  }

  // --- Kurulum ---

  private drawBoard(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(BOARD_RADIUS)

    const grid = this.add.graphics()
    grid.lineStyle(1, COLORS.GRID_LINE, GRID_LINE_ALPHA)
    for (let col = 0; col <= GRID_COLS; col++) {
      const x = BOARD_PADDING + col * CELL_SIZE
      grid.lineBetween(x, BOARD_PADDING, x, GAME_HEIGHT - BOARD_PADDING)
    }
    for (let row = 0; row <= GRID_ROWS; row++) {
      const y = BOARD_PADDING + row * CELL_SIZE
      grid.lineBetween(BOARD_PADDING, y, GAME_WIDTH - BOARD_PADDING, y)
    }
  }

  private bindKeyboard(): void {
    const keyboard = this.input.keyboard
    if (!keyboard) return

    for (const [event, direction] of Object.entries(KEY_BINDINGS)) {
      keyboard.on(event, () => this.snake.turn(direction))
    }
    for (const event of PAUSE_EVENTS) {
      keyboard.on(event, () => this.togglePause())
    }
    keyboard.addCapture(CAPTURED_KEYS)
  }

  /** Ad yazarken oyun tuşları devreye girmesin (WASD ve boşluk isme yazılabilsin). */
  private setTyping(typing: boolean): void {
    const keyboard = this.input.keyboard
    if (!keyboard) return
    keyboard.enabled = !typing
    if (typing) keyboard.removeCapture(CAPTURED_KEYS)
    else keyboard.addCapture(CAPTURED_KEYS)
  }

  private bindSwipe(): void {
    const target = document.getElementById(SWIPE_TARGET_ID) ?? this.game.canvas
    this.swipe = new SwipeInput(target, (direction) => this.snake.turn(direction))
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.swipe?.destroy())
  }

  // --- Oyun akışı ---

  private advance(): void {
    const result = this.snake.step()

    if (result.ate) {
      sesler.yem()
      this.hud.setScore(this.snake.score)
      this.hud.showGain(result.gained)
      if (result.ateAt) this.popAt(result.ateAt)
    }

    this.render()

    if (result.died) this.finish('Oyun bitti', 'Tekrar dene')
    else if (this.snake.status === 'won') this.finish('Tahtayı doldurdun! 🎉', 'Yeniden oyna')
  }

  private finish(title: string, primaryLabel: string): void {
    if (this.snake.status === 'won') sesler.zafer()
    else sesler.carpma()
    this.cameras.main.shake(DEATH_SHAKE_MS, DEATH_SHAKE_INTENSITY)
    const score = this.snake.score
    const summary = `Uzunluk: ${this.snake.length} · Skor: ${score}`

    this.time.delayedCall(OVERLAY_DELAY_MS, () => {
      this.recorder.finish(score, {
        title,
        text: `${summary} — skor tablosuna girdin!`,
        onDone: () =>
          this.hud.showOverlay({
            title,
            text: summary,
            primaryLabel,
            onPrimary: () => this.startNewGame(),
          }),
      })
    })
  }

  private togglePause(): void {
    if (this.snake.status === 'playing') this.pause()
    else if (this.snake.status === 'paused') this.resume()
  }

  private pause(): void {
    this.snake.togglePause()
    this.hud.showOverlay({
      title: 'Duraklatıldı',
      text: 'Kaldığın yerden devam edebilirsin.',
      primaryLabel: 'Devam et',
      onPrimary: () => this.resume(),
      secondaryLabel: 'Yeni oyun',
      onSecondary: () => this.startNewGame(),
    })
  }

  private resume(): void {
    if (this.snake.status === 'paused') this.snake.togglePause()
    this.hud.hideOverlay()
    this.accumulator = 0
  }

  /** Yeni oyun; süren turda kayda değer bir skor varsa önce adı sorulur. */
  private startNewGame(): void {
    const score = this.snake.score
    if (!this.snake.isFinished && this.recorder.qualifies(score)) {
      // Ad yazılırken yılan arka planda ilerleyip duvara çarpmasın.
      if (this.snake.status === 'playing') this.snake.togglePause()
      this.recorder.finish(score, {
        title: 'Skorunu kaydet',
        text: `Bu turda ${score} puan yaptın. Tabloya adını yazmak ister misin?`,
        onDone: () => this.resetGame(),
      })
      return
    }
    this.resetGame()
  }

  private resetGame(): void {
    this.hud.hideOverlay()
    this.time.removeAllEvents()
    this.snake.reset()
    this.accumulator = 0
    this.hud.setScore(0)
    this.render()
  }

  // --- Görünüm ---

  private render(): void {
    const segments = this.snake.segments
    this.ensurePool(segments.length)
    // Baş hariç gövde, baştan kuyruğa doğru koyulaşsın.
    const bodySpan = Math.max(1, segments.length - 1)

    for (let i = 0; i < this.segmentViews.length; i++) {
      const view = this.segmentViews[i]
      const cell = segments[i]
      if (!cell) {
        view.setVisible(false)
        continue
      }
      view.setVisible(true)
      view.setPosition(this.cellX(cell.x), this.cellY(cell.y))
      view.setFillStyle(
        i === 0 ? COLORS.SNAKE_HEAD : lerpColor(COLORS.SNAKE_BODY, COLORS.SNAKE_TAIL, (i - 1) / bodySpan),
      )
    }

    const food = this.snake.food
    this.foodView.setVisible(Boolean(food))
    if (food) this.foodView.setPosition(this.cellX(food.x), this.cellY(food.y))

    this.renderEyes()
    this.readyLabel.setVisible(this.snake.status === 'ready')
  }

  private ensurePool(size: number): void {
    while (this.segmentViews.length < size) {
      const view = this.add
        .rectangle(0, 0, CELL_SIZE - SEGMENT_INSET, CELL_SIZE - SEGMENT_INSET, COLORS.SNAKE_BODY)
        .setRounded(SEGMENT_RADIUS)
      this.segmentLayer.add(view)
      this.segmentViews.push(view)
    }
  }

  private renderEyes(): void {
    const head = this.snake.segments[0]
    const vector = DIRECTION_VECTORS[this.snake.facing]
    const forwardX = this.cellX(head.x) + vector.x * CELL_SIZE * EYE_FORWARD
    const forwardY = this.cellY(head.y) + vector.y * CELL_SIZE * EYE_FORWARD
    // Bakış yönüne dik kayma: gözler yan yana dursun.
    const sideX = -vector.y * CELL_SIZE * EYE_SIDE
    const sideY = vector.x * CELL_SIZE * EYE_SIDE

    this.eyes[0].setPosition(forwardX + sideX, forwardY + sideY)
    this.eyes[1].setPosition(forwardX - sideX, forwardY - sideY)
  }

  /** Yem yenen hücrede genişleyip sönen halka. */
  private popAt(cell: Cell): void {
    const ring = this.add.circle(this.cellX(cell.x), this.cellY(cell.y), FOOD_RADIUS, COLORS.FOOD, 0.5)
    this.tweens.add({
      targets: ring,
      scale: EAT_POP_SCALE,
      alpha: 0,
      duration: EAT_POP_MS,
      ease: 'Quad.easeOut',
      onComplete: () => ring.destroy(),
    })
  }

  private cellX(col: number): number {
    return BOARD_PADDING + col * CELL_SIZE + CELL_SIZE / 2
  }

  private cellY(row: number): number {
    return BOARD_PADDING + row * CELL_SIZE + CELL_SIZE / 2
  }
}
