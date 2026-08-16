/** 15'li kaydırmalı puzzle sabitleri. */

export const GRID_SIZE = 4
export const TILE_SIZE = 115
export const TILE_GAP = 10
export const BOARD_PADDING = TILE_GAP
export const GAME_WIDTH = GRID_SIZE * TILE_SIZE + (GRID_SIZE + 1) * TILE_GAP
export const GAME_HEIGHT = GAME_WIDTH
export const BOARD_RADIUS = 14
export const TILE_RADIUS = 10

/** Karıştırırken uygulanan geçerli hamle sayısı — çözülebilirlik garanti olsun diye. */
export const SHUFFLE_MOVES = 200

export const SLIDE_DURATION = 110
export const WIN_POP_DURATION = 220
export const WIN_POP_SCALE = 1.08

// Skor: hızlı ve az hamleyle bitiren yüksek puan alır.
export const BASE_SCORE = 3000
export const MOVE_PENALTY = 5
export const SECOND_PENALTY = 3
export const MIN_SCORE = 100

export const SWIPE_TARGET_ID = 'game-stage'
export const GAME_PARENT_ID = 'game'

export const FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
export const TILE_FONT_SIZE = 46

export const COLORS = {
  BOARD: 0x2b2118,
  EMPTY: 0x241c15,
  TILE: 0x8b5cf6,
  TILE_HOME: 0x6d28d9,
  TEXT: '#f6efe4',
} as const

export function skorHesapla(hamle: number, saniye: number): number {
  return Math.max(MIN_SCORE, BASE_SCORE - hamle * MOVE_PENALTY - saniye * SECOND_PENALTY)
}
