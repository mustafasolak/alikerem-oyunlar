/** FreeCell sabitleri. */

export const GAME_WIDTH = 510
export const GAME_HEIGHT = 700
export const GAME_PARENT_ID = 'game'

export const SUTUN_SAYISI = 8
export const KART_GENISLIK = 56
export const KART_YUKSEKLIK = 80
/** Kart yazısının sol üst köşedeki yeri: üst üste binen kartlarda görünen şerit. */
export const YAZI_KENAR = 7
export const YAZI_UST = 13

export const KART_ARALIK = 5
export const UST_SIRA_Y = 20
export const SUTUN_UST = 130
export const KAYMA = 22

export const TEMEL_PUANI = 60
export const HAMLE_CEZASI = 2
export const MIN_SKOR = 50

export const FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

export const COLORS = {
  BOARD: 0x082033,
  BOS: 0x0e3450,
  KART: 0xf8fafc,
  SECILI: 0xfacc15,
  SIYAH: '#0f172a',
  KIRMIZI: '#dc2626',
} as const

export function skorHesapla(temel: number, hamle: number): number {
  return Math.max(MIN_SKOR, temel * TEMEL_PUANI - hamle * HAMLE_CEZASI)
}
