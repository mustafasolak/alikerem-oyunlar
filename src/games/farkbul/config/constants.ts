/** Farkları Bul sabitleri. Desenler kodla üretiliyor, görsel dosya yok. */

export const GAME_WIDTH = 510
export const GAME_HEIGHT = 700
export const GAME_PARENT_ID = 'game'

export const SUTUN = 5
export const SATIR = 5
export const FARK_SAYISI = 5

export const PANEL_GENISLIK = 470
export const PANEL_YUKSEKLIK = 320
export const UST_PANEL_Y = 20
export const ALT_PANEL_Y = 360

export const SEKIL_PUANI = 200
export const SURE_BONUS_LIMITI = 180
export const MIN_SKOR = 100

export const COLORS = {
  BOARD: 0x06231f,
  PANEL: 0x0d3a33,
  BULUNDU: 0x22c55e,
} as const

export const SEKIL_RENKLERI = [0x2dd4bf, 0xfbbf24, 0xf472b6, 0xa78bfa, 0x60a5fa, 0xfb923c]

export function skorHesapla(bulunan: number, saniye: number): number {
  return Math.max(MIN_SKOR, bulunan * SEKIL_PUANI + Math.max(0, SURE_BONUS_LIMITI - saniye))
}
