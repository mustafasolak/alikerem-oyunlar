/** Zuma sabitleri. Zincir sabit bir yol üzerinde ilerler. */

export const GAME_WIDTH = 510
export const GAME_HEIGHT = 510
export const GAME_PARENT_ID = 'game'

export const TOP_R = 15
export const TOP_ARALIK = 30
export const RENK_SAYISI = 5
export const BASLANGIC_TOP = 22
export const MAX_ZINCIR = 42
/** Zincirin bir adım ilerlemesi (ms). */
export const ILERLEME_MS = 900

export const ATICI_X = 255
export const ATICI_Y = 255

export const TOP_PUANI = 25
export const KALAN_PUANI = 10

export const COLORS = {
  BOARD: 0x14240b,
  YOL: 0x22350f,
  ATICI: 0xa3e635,
} as const

export const TOP_RENKLERI = [0xef4444, 0x3b82f6, 0x22c55e, 0xeab308, 0xa855f7]
