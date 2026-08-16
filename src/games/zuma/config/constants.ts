/** Zuma sabitleri. Zincir sabit bir spiral yol üzerinde ilerler. */

export const GAME_WIDTH = 510
export const GAME_HEIGHT = 510
export const GAME_PARENT_ID = 'game'

export const TOP_R = 15
/** Yol üzerinde iki top merkezi arası mesafe (piksel) — toplar bitişik dursun. */
export const TOP_ARALIK = 30
export const RENK_SAYISI = 5
export const BASLANGIC_TOP = 20
export const MAX_ZINCIR = 40
export const ILERLEME_MS = 1100

export const ATICI_X = 255
export const ATICI_Y = 255
export const UCUS_SURESI = 220
export const PATLAMA_SURESI = 200

/** Spiral: dıştan içe. */
export const SPIRAL_DIS_YARICAP = 215
export const SPIRAL_IC_YARICAP = 52
export const SPIRAL_TUR = 2.4

export const TOP_PUANI = 25
export const KALAN_PUANI = 10

export const COLORS = {
  BOARD: 0x14240b,
  YOL: 0x25390f,
  YOL_KENAR: 0x3d5c18,
  ATICI: 0x4d7c0f,
  NISAN: 0xd9f99d,
  AGIZ: 0x1a2b08,
} as const

export const TOP_RENKLERI = [0xef4444, 0x3b82f6, 0x22c55e, 0xeab308, 0xa855f7]
