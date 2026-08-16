/** Kelime Avı sabitleri. */

export const GRID_SIZE = 12
export const CELL = 40
export const BOARD_PADDING = 15
export const GAME_WIDTH = GRID_SIZE * CELL + BOARD_PADDING * 2
export const GAME_HEIGHT = GAME_WIDTH
export const BOARD_RADIUS = 14

export const KELIME_SAYISI = 8
export const MIN_KELIME = 3
export const MAX_KELIME = GRID_SIZE
/** Bir kelimeyi yerleştirmek için denenecek rastgele konum sayısı. */
export const YERLESTIRME_DENEMESI = 250

export const KELIME_PUANI = 100
export const SURE_BONUS_LIMITI = 400
export const SURE_BONUS_KATSAYI = 2

export const BULMA_POP_MS = 220
export const BULMA_POP_SCALE = 1.25

export const GAME_PARENT_ID = 'game'
export const FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
export const HARF_FONT = 22

export const COLORS = {
  BOARD: 0x10241f,
  HUCRE: 0x16302a,
  SECILI: 0x2dd4bf,
  BULUNAN: 0x0f766e,
  HARF: '#d7efe9',
  HARF_BULUNAN: '#ffffff',
} as const

export function skorHesapla(bulunan: number, saniye: number, tamamlandi: boolean): number {
  const taban = bulunan * KELIME_PUANI
  if (!tamamlandi) return taban
  return taban + Math.max(0, SURE_BONUS_LIMITI - saniye) * SURE_BONUS_KATSAYI
}
