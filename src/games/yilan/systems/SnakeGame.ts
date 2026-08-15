/**
 * Yılan'ın saf oyun mantığı. Phaser'a hiç bağımlı değil, tek başına test edilebilir.
 * Sahne yalnızca buradaki durumu okuyup çizer, adımları `step()` ile ilerletir.
 */

import {
  GRID_COLS,
  GRID_ROWS,
  MAX_QUEUED_TURNS,
  SCORE_PER_FOOD,
  START_LENGTH,
  STEP_MIN_MS,
  STEP_SPEEDUP_MS,
  STEP_START_MS,
} from '../config/constants.ts'

export type Direction = 'up' | 'down' | 'left' | 'right'
/** ready: ilk yön bekleniyor · won: tahta tamamen doldu */
export type SnakeStatus = 'ready' | 'playing' | 'paused' | 'over' | 'won'

export interface Cell {
  x: number
  y: number
}

export interface StepResult {
  /** Yılan gerçekten bir hücre ilerledi mi? */
  stepped: boolean
  ate: boolean
  died: boolean
  gained: number
  /** Yem yendiyse yemin durduğu hücre (animasyon için). */
  ateAt: Cell | null
}

export const DIRECTION_VECTORS: Record<Direction, Cell> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

const OPPOSITE: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
}

const IDLE_STEP: StepResult = { stepped: false, ate: false, died: false, gained: 0, ateAt: null }

export class SnakeGame {
  readonly cols: number
  readonly rows: number

  /** segments[0] baş, son eleman kuyruk ucu. */
  segments: Cell[] = []
  food: Cell | null = null
  score = 0
  status: SnakeStatus = 'ready'

  private facingDirection: Direction = 'right'
  private pendingTurns: Direction[] = []
  private foodEaten = 0
  private readonly random: () => number

  constructor(cols: number = GRID_COLS, rows: number = GRID_ROWS, random: () => number = Math.random) {
    this.cols = cols
    this.rows = rows
    this.random = random
    this.reset()
  }

  // --- Durum okuma ---

  get facing(): Direction {
    return this.facingDirection
  }

  get length(): number {
    return this.segments.length
  }

  /** Skor arttıkça kısalan adım aralığı (ms). */
  get stepInterval(): number {
    return Math.max(STEP_MIN_MS, STEP_START_MS - this.foodEaten * STEP_SPEEDUP_MS)
  }

  get isFinished(): boolean {
    return this.status === 'over' || this.status === 'won'
  }

  // --- Oyun akışı ---

  reset(): void {
    const centerX = Math.floor(this.cols / 2)
    const centerY = Math.floor(this.rows / 2)

    this.segments = []
    for (let i = 0; i < START_LENGTH; i++) {
      this.segments.push({ x: centerX - i, y: centerY })
    }

    this.score = 0
    this.foodEaten = 0
    this.facingDirection = 'right'
    this.pendingTurns = []
    this.status = 'ready'
    this.spawnFood()
  }

  /**
   * Yön ister. Geri dönüş (180°) ve aynı yön yok sayılır.
   * `ready` durumundayken ilk geçerli yön oyunu başlatır.
   */
  turn(direction: Direction): void {
    if (this.isFinished || this.status === 'paused') return

    const last = this.pendingTurns.at(-1) ?? this.facingDirection
    // Kendi üzerine dönmek anında ölüm olurdu; başlangıçta da engelle.
    if (direction === OPPOSITE[last]) return

    if (this.status === 'ready') this.status = 'playing'
    if (direction === last) return
    if (this.pendingTurns.length >= MAX_QUEUED_TURNS) return

    this.pendingTurns.push(direction)
  }

  /** Duraklat / devam et. Sadece oyun sürerken anlamlı. */
  togglePause(): void {
    if (this.status === 'playing') this.status = 'paused'
    else if (this.status === 'paused') this.status = 'playing'
  }

  /** Bir hücre ilerler. Sahne bunu adım aralığına göre çağırır. */
  step(): StepResult {
    if (this.status !== 'playing') return IDLE_STEP

    const queued = this.pendingTurns.shift()
    if (queued) this.facingDirection = queued

    const vector = DIRECTION_VECTORS[this.facingDirection]
    const head = this.segments[0]
    const next: Cell = { x: head.x + vector.x, y: head.y + vector.y }

    if (next.x < 0 || next.x >= this.cols || next.y < 0 || next.y >= this.rows) {
      this.status = 'over'
      return { stepped: false, ate: false, died: true, gained: 0, ateAt: null }
    }

    const ateAt = this.food && this.food.x === next.x && this.food.y === next.y ? this.food : null
    // Yem yenmiyorsa kuyruk ucu bu adımda boşalacağı için çarpışma sayılmaz.
    const blocking = ateAt ? this.segments : this.segments.slice(0, -1)
    if (blocking.some((cell) => cell.x === next.x && cell.y === next.y)) {
      this.status = 'over'
      return { stepped: false, ate: false, died: true, gained: 0, ateAt: null }
    }

    this.segments.unshift(next)
    if (!ateAt) {
      this.segments.pop()
      return { stepped: true, ate: false, died: false, gained: 0, ateAt: null }
    }

    this.score += SCORE_PER_FOOD
    this.foodEaten++
    this.spawnFood()
    if (!this.food) this.status = 'won'

    return { stepped: true, ate: true, died: false, gained: SCORE_PER_FOOD, ateAt }
  }

  // --- Yardımcılar ---

  private spawnFood(): void {
    const free: Cell[] = []
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (!this.segments.some((cell) => cell.x === x && cell.y === y)) free.push({ x, y })
      }
    }

    this.food = free.length === 0 ? null : free[Math.floor(this.random() * free.length)]
  }
}
