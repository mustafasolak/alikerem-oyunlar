/** Domino Bulmacası sabitleri. */

export const GAME_WIDTH = 510
export const GAME_HEIGHT = 510
export const GAME_PARENT_ID = 'game'

export const EN_BUYUK = 6
export const EL_SAYISI = 7

export const TAS_GENISLIK = 56
export const TAS_YUKSEKLIK = 30
export const ZINCIR_Y = 150
export const EL_Y = 400
export const NOKTA_R = 3.4

export const TAS_PUANI = 120
export const SURE_BONUS_LIMITI = 240
export const MIN_SKOR = 100

export const FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

export const COLORS = {
  BOARD: 0x2b2205,
  TAS: 0xfef3c7,
  TAS_SECILI: 0xfbbf24,
  ZINCIR: 0xfde68a,
  NOKTA: 0x2b2205,
  YAZI: '#fde68a',
} as const

export function skorHesapla(konan: number, saniye: number): number {
  return Math.max(MIN_SKOR, konan * TAS_PUANI + Math.max(0, SURE_BONUS_LIMITI - saniye))
}
