import * as Phaser from 'phaser'

import {
  BOARD_PADDING,
  BOARD_RADIUS,
  BOARD_SIZE,
  CELL_GAP,
  CELL_SIZE,
  COLORS,
  FONT_FAMILY,
  GRID_SIZE,
  MERGE_POP_DURATION,
  MERGE_POP_SCALE,
  MOVE_DURATION,
  SPAWN_DURATION,
  SWIPE_TARGET_ID,
  TILE_RADIUS,
  TURN_DURATION,
  fontSizeFor,
  tileStyleFor,
} from '../config/constants.ts'
import { Board2048, type Direction, type Tile } from '../systems/Board2048.ts'
import { GameStorage } from '../systems/GameStorage.ts'
import { GameHud } from '../../../shared/GameHud.ts'
import { SwipeInput } from '../../../shared/SwipeInput.ts'

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

export class GameScene extends Phaser.Scene {
  private readonly board = new Board2048()
  private readonly views = new Map<number, Phaser.GameObjects.Container>()

  private hud!: GameHud
  private tileLayer!: Phaser.GameObjects.Container
  private swipe?: SwipeInput
  private best = 0
  /** Animasyon sürerken yeni hamleyi yok say. */
  private busy = false

  constructor() {
    super('Game2048')
  }

  create(): void {
    this.drawBoard()
    this.tileLayer = this.add.container(0, 0)

    this.best = GameStorage.loadBest()
    this.hud = new GameHud({ onRestart: () => this.startNewGame() })
    this.hud.setBest(this.best)

    const saved = GameStorage.loadGame()
    if (!saved || !this.board.restore(saved)) {
      this.board.reset()
    }

    this.syncScore()
    this.renderAll()
    this.bindKeyboard()
    this.bindSwipe()

    if (this.board.isOver) this.showGameOver()
  }

  // --- Kurulum ---

  private drawBoard(): void {
    this.add.rectangle(BOARD_SIZE / 2, BOARD_SIZE / 2, BOARD_SIZE, BOARD_SIZE, COLORS.BOARD).setRounded(BOARD_RADIUS)

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        this.add
          .rectangle(this.cellX(col), this.cellY(row), CELL_SIZE, CELL_SIZE, COLORS.EMPTY_CELL)
          .setRounded(TILE_RADIUS)
      }
    }
  }

  private bindKeyboard(): void {
    const keyboard = this.input.keyboard
    if (!keyboard) return

    for (const [event, direction] of Object.entries(KEY_BINDINGS)) {
      keyboard.on(event, () => this.tryMove(direction))
    }
    // Ok tuşları sayfayı kaydırmasın.
    keyboard.addCapture(['LEFT', 'RIGHT', 'UP', 'DOWN'])
  }

  private bindSwipe(): void {
    const target = document.getElementById(SWIPE_TARGET_ID) ?? this.game.canvas
    this.swipe = new SwipeInput(target, (direction) => this.tryMove(direction))
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.swipe?.destroy())
  }

  // --- Hamle akışı ---

  private tryMove(direction: Direction): void {
    if (this.busy || this.board.status !== 'playing') return

    const result = this.board.move(direction)
    if (!result.moved) return

    this.busy = true
    this.animateMove()
    this.syncScore()
    this.hud.showGain(result.gained)
    this.persist()

    this.time.delayedCall(TURN_DURATION, () => {
      this.busy = false
      this.checkOutcome()
    })
  }

  private animateMove(): void {
    const liveIds = new Set<number>()

    for (const tile of this.board.tiles) {
      liveIds.add(tile.id)
      const x = this.cellX(tile.col)
      const y = this.cellY(tile.row)

      if (tile.mergedFrom) {
        // Kaynak kareler hedef hücreye kayar, sonra yok olur.
        for (const source of tile.mergedFrom) {
          const view = this.views.get(source.id)
          if (!view) continue
          this.views.delete(source.id)
          this.tweens.add({
            targets: view,
            x,
            y,
            duration: MOVE_DURATION,
            ease: 'Quad.easeOut',
            onComplete: () => view.destroy(),
          })
        }
        // Birleşmiş kare kayma bitene kadar gizli bekler, sonra zıplayarak belirir.
        const merged = this.createTileView(tile)
        merged.setVisible(false)
        this.time.delayedCall(MOVE_DURATION, () => this.popIn(merged))
        continue
      }

      if (tile.isNew) {
        const view = this.createTileView(tile)
        view.setScale(0)
        this.tweens.add({
          targets: view,
          scale: 1,
          duration: SPAWN_DURATION,
          delay: MOVE_DURATION,
          ease: 'Back.easeOut',
        })
        continue
      }

      const view = this.views.get(tile.id)
      if (!view) {
        this.createTileView(tile)
        continue
      }
      if (view.x !== x || view.y !== y) {
        this.tweens.add({ targets: view, x, y, duration: MOVE_DURATION, ease: 'Quad.easeOut' })
      }
    }

    // Tahtada karşılığı kalmayan görünümleri at.
    for (const [id, view] of this.views) {
      if (liveIds.has(id)) continue
      view.destroy()
      this.views.delete(id)
    }
  }

  private popIn(view: Phaser.GameObjects.Container): void {
    view.setVisible(true)
    view.setScale(1)
    this.tweens.add({
      targets: view,
      scale: MERGE_POP_SCALE,
      duration: MERGE_POP_DURATION / 2,
      yoyo: true,
      ease: 'Quad.easeOut',
    })
  }

  private checkOutcome(): void {
    if (this.board.status === 'won') this.showWin()
    else if (this.board.status === 'lost') this.showGameOver()
  }

  private startNewGame(): void {
    this.hud.hideOverlay()
    this.busy = false
    this.board.reset()
    this.syncScore()
    this.renderAll()
    this.persist()
  }

  // --- Görünüm ---

  private renderAll(): void {
    this.tweens.killAll()
    this.time.removeAllEvents()
    this.tileLayer.removeAll(true)
    this.views.clear()

    for (const tile of this.board.tiles) {
      this.createTileView(tile)
    }
  }

  private createTileView(tile: Tile): Phaser.GameObjects.Container {
    const style = tileStyleFor(tile.value)

    const rect = this.add.rectangle(0, 0, CELL_SIZE, CELL_SIZE, style.fill).setRounded(TILE_RADIUS)
    const label = this.add
      .text(0, 0, String(tile.value), {
        fontFamily: FONT_FAMILY,
        fontSize: `${fontSizeFor(tile.value)}px`,
        fontStyle: 'bold',
        color: style.text,
      })
      .setOrigin(0.5)

    const container = this.add.container(this.cellX(tile.col), this.cellY(tile.row), [rect, label])
    this.tileLayer.add(container)
    this.views.set(tile.id, container)
    return container
  }

  private cellX(col: number): number {
    return BOARD_PADDING + col * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2
  }

  private cellY(row: number): number {
    return BOARD_PADDING + row * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2
  }

  // --- Skor ve sonuç ---

  private syncScore(): void {
    this.hud.setScore(this.board.score)
    if (this.board.score > this.best) {
      this.best = this.board.score
      this.hud.setBest(this.best)
      GameStorage.saveBest(this.best)
    }
  }

  private persist(): void {
    GameStorage.saveGame(this.board.toSave())
  }

  private showWin(): void {
    this.hud.showOverlay({
      title: 'Kazandın! 🎉',
      text: `2048 karesine ulaştın. Skor: ${this.board.score}`,
      primaryLabel: 'Devam et',
      onPrimary: () => {
        this.hud.hideOverlay()
        this.board.continueAfterWin()
        this.persist()
        if (this.board.isOver) this.showGameOver()
      },
      secondaryLabel: 'Yeni oyun',
      onSecondary: () => this.startNewGame(),
    })
  }

  private showGameOver(): void {
    GameStorage.clearGame()
    this.hud.showOverlay({
      title: 'Oyun bitti',
      text: `Hamle kalmadı. Skor: ${this.board.score}`,
      primaryLabel: 'Tekrar dene',
      onPrimary: () => this.startNewGame(),
    })
  }
}
