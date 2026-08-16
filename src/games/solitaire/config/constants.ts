/** Solitaire (Klondike) sabitleri. */

export const GAME_WIDTH = 510
export const GAME_HEIGHT = 700
export const GAME_PARENT_ID = 'game'

export const SUTUN_SAYISI = 7
export const KART_GENISLIK = 62
export const KART_YUKSEKLIK = 88
export const KART_ARALIK = 8
export const UST_SIRA_Y = 20
export const SUTUN_UST = 140
export const ACIK_KAYMA = 24
export const KAPALI_KAYMA = 10

export const TEMEL_PUANI = 60
export const HAMLE_CEZASI = 2
export const MIN_SKOR = 50

export const FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

export const COLORS = {
  BOARD: 0x0b3d1f,
  BOS: 0x0f5129,
  KART: 0xf8fafc,
  KART_ARKA: 0x1e40af,
  SECILI: 0xfacc15,
  SIYAH: '#0f172a',
  KIRMIZI: '#dc2626',
} as const

export function skorHesapla(temel: number, hamle: number): number {
  return Math.max(MIN_SKOR, temel * TEMEL_PUANI - hamle * HAMLE_CEZASI)
}
