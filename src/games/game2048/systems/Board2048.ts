/**
 * 2048'in saf oyun mantığı. Phaser'a hiç bağımlı değil, tek başına test edilebilir.
 * Sahne yalnızca buradaki durumu okuyup çizer.
 */

import {
  GRID_SIZE,
  SPAWN_FOUR_CHANCE,
  SPAWN_VALUE_HIGH,
  SPAWN_VALUE_LOW,
  START_TILE_COUNT,
  WINNING_VALUE,
} from '../config/constants.ts'

export type Direction = 'up' | 'down' | 'left' | 'right'
export type BoardStatus = 'playing' | 'won' | 'lost'

export interface Tile {
  id: number
  value: number
  row: number
  col: number
  /** Son hamleden önceki konum; yeni doğan karelerde null. */
  prevRow: number | null
  prevCol: number | null
  /** Bu kare iki karenin birleşmesiyle oluştuysa kaynakları. */
  mergedFrom: [Tile, Tile] | null
  /** Son hamlede yeni doğduysa true. */
  isNew: boolean
}

export interface MoveResult {
  /** Tahtada gerçekten bir değişiklik oldu mu? */
  moved: boolean
  /** Bu hamlede kazanılan puan. */
  gained: number
  /** İlk kez 2048'e ulaşıldı mı? */
  justWon: boolean
}

export interface SavedBoard {
  grid: number[][]
  score: number
  keepPlaying: boolean
}

interface Vector {
  row: number
  col: number
}

const VECTORS: Record<Direction, Vector> = {
  up: { row: -1, col: 0 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
  right: { row: 0, col: 1 },
}

export class Board2048 {
  readonly size: number

  score = 0
  status: BoardStatus = 'playing'
  /** 2048'e ulaştıktan sonra oyuncu devam etmeyi seçtiyse true. */
  keepPlaying = false

  private cells: (Tile | null)[][]
  private nextId = 1
  private readonly random: () => number

  constructor(size: number = GRID_SIZE, random: () => number = Math.random) {
    this.size = size
    this.random = random
    this.cells = this.emptyGrid()
    this.reset()
  }

  // --- Durum okuma ---

  get tiles(): Tile[] {
    const list: Tile[] = []
    for (const row of this.cells) {
      for (const tile of row) {
        if (tile) list.push(tile)
      }
    }
    return list
  }

  tileAt(row: number, col: number): Tile | null {
    return this.withinBounds(row, col) ? this.cells[row][col] : null
  }

  get isOver(): boolean {
    return this.status === 'lost'
  }

  // --- Oyun akışı ---

  reset(): void {
    this.cells = this.emptyGrid()
    this.nextId = 1
    this.score = 0
    this.status = 'playing'
    this.keepPlaying = false
    for (let i = 0; i < START_TILE_COUNT; i++) {
      this.spawnRandomTile()
    }
  }

  /** 2048'e ulaştıktan sonra oynamaya devam et. */
  continueAfterWin(): void {
    this.keepPlaying = true
    if (this.status === 'won') {
      this.status = this.hasMoves() ? 'playing' : 'lost'
    }
  }

  move(direction: Direction): MoveResult {
    const result: MoveResult = { moved: false, gained: 0, justWon: false }
    if (this.status === 'lost' || this.status === 'won') return result

    this.clearMoveMarkers()

    const vector = VECTORS[direction]
    const rows = this.traversalOrder(vector.row)
    const cols = this.traversalOrder(vector.col)

    for (const row of rows) {
      for (const col of cols) {
        const tile = this.cells[row][col]
        if (!tile) continue

        const { farthest, next } = this.findFarthest(row, col, vector)
        const target = next ? this.cells[next.row][next.col] : null

        if (target && target.value === tile.value && !target.mergedFrom) {
          // Birleşme: iki kare yok olur, yerine iki katı değerde yeni bir kare doğar.
          const merged = this.createTile(next!.row, next!.col, tile.value * 2)
          merged.mergedFrom = [tile, target]
          merged.prevRow = target.row
          merged.prevCol = target.col

          this.cells[row][col] = null
          this.cells[next!.row][next!.col] = merged

          result.gained += merged.value
          this.score += merged.value
          result.moved = true

          if (merged.value === WINNING_VALUE && !this.keepPlaying) {
            result.justWon = true
          }
        } else {
          this.moveTile(tile, farthest.row, farthest.col)
          if (tile.row !== row || tile.col !== col) result.moved = true
        }
      }
    }

    if (result.moved) {
      this.spawnRandomTile()
      if (result.justWon) {
        this.status = 'won'
      } else if (!this.hasMoves()) {
        this.status = 'lost'
      }
    }

    return result
  }

  /** Herhangi bir yöne hamle kaldı mı? */
  hasMoves(): boolean {
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const tile = this.cells[row][col]
        if (!tile) return true
        const right = this.cells[row][col + 1]
        const down = this.cells[row + 1]?.[col]
        if (right && right.value === tile.value) return true
        if (down && down.value === tile.value) return true
      }
    }
    return false
  }

  // --- Kayıt ---

  toSave(): SavedBoard {
    return {
      grid: this.cells.map((row) => row.map((tile) => tile?.value ?? 0)),
      score: this.score,
      keepPlaying: this.keepPlaying,
    }
  }

  /** Kaydedilmiş oyunu yükler; veri bozuksa false döner ve tahta değişmez. */
  restore(saved: SavedBoard): boolean {
    if (!Array.isArray(saved.grid) || saved.grid.length !== this.size) return false
    if (saved.grid.some((row) => !Array.isArray(row) || row.length !== this.size)) return false
    if (!Number.isFinite(saved.score)) return false

    const cells = this.emptyGrid()
    let id = 1
    let hasTile = false

    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const value = saved.grid[row][col]
        if (!Number.isFinite(value) || value <= 0) continue
        cells[row][col] = { id: id++, value, row, col, prevRow: null, prevCol: null, mergedFrom: null, isNew: false }
        hasTile = true
      }
    }
    if (!hasTile) return false

    this.cells = cells
    this.nextId = id
    this.score = saved.score
    this.keepPlaying = Boolean(saved.keepPlaying)
    this.status = this.hasMoves() ? 'playing' : 'lost'
    return true
  }

  // --- Yardımcılar ---

  private emptyGrid(): (Tile | null)[][] {
    return Array.from({ length: this.size }, () => Array<Tile | null>(this.size).fill(null))
  }

  private clearMoveMarkers(): void {
    for (const tile of this.tiles) {
      tile.prevRow = tile.row
      tile.prevCol = tile.col
      tile.mergedFrom = null
      tile.isNew = false
    }
  }

  private createTile(row: number, col: number, value: number): Tile {
    return { id: this.nextId++, value, row, col, prevRow: null, prevCol: null, mergedFrom: null, isNew: false }
  }

  private moveTile(tile: Tile, row: number, col: number): void {
    this.cells[tile.row][tile.col] = null
    this.cells[row][col] = tile
    tile.row = row
    tile.col = col
  }

  private spawnRandomTile(): Tile | null {
    const free: Vector[] = []
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (!this.cells[row][col]) free.push({ row, col })
      }
    }
    if (free.length === 0) return null

    const spot = free[Math.floor(this.random() * free.length)]
    const value = this.random() < SPAWN_FOUR_CHANCE ? SPAWN_VALUE_HIGH : SPAWN_VALUE_LOW
    const tile = this.createTile(spot.row, spot.col, value)
    tile.isNew = true
    this.cells[spot.row][spot.col] = tile
    return tile
  }

  /** Hareket yönüne göre en uzaktaki kareden başlayacak şekilde tarama sırası. */
  private traversalOrder(delta: number): number[] {
    const order = Array.from({ length: this.size }, (_, index) => index)
    return delta > 0 ? order.reverse() : order
  }

  private findFarthest(row: number, col: number, vector: Vector): { farthest: Vector; next: Vector | null } {
    let current = { row, col }
    let next = { row: row + vector.row, col: col + vector.col }

    while (this.withinBounds(next.row, next.col) && !this.cells[next.row][next.col]) {
      current = next
      next = { row: next.row + vector.row, col: next.col + vector.col }
    }

    return {
      farthest: current,
      next: this.withinBounds(next.row, next.col) ? next : null,
    }
  }

  private withinBounds(row: number, col: number): boolean {
    return row >= 0 && row < this.size && col >= 0 && col < this.size
  }
}
