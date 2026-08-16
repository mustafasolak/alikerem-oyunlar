/** Wordle sabitleri. */

export const GAME_WIDTH = 420
export const GAME_HEIGHT = 520
export const GAME_PARENT_ID = 'game'

export const HARF_SAYISI = 5
export const MAX_DENEME = 6

export const KUTU = 62
export const KUTU_ARALIK = 8
export const KUTU_RADIUS = 8
export const UST_BOSLUK = 16

export const TABAN_PUAN = 1800
export const DENEME_CEZASI = 200
export const MIN_SKOR = 200

export const ACILMA_SURESI = 130
export const SALLANMA_SURESI = 220

export const FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
export const HARF_FONT = 30

export const COLORS = {
  BOS: 0x1f2937,
  BOS_KENAR: 0x374151,
  DOLU_KENAR: 0x6b7280,
  DOGRU: 0x22c55e,
  VAR: 0xeab308,
  YOK: 0x4b5563,
  YAZI: '#ffffff',
} as const

export function skorHesapla(deneme: number): number {
  return Math.max(MIN_SKOR, TABAN_PUAN - (deneme - 1) * DENEME_CEZASI)
}
