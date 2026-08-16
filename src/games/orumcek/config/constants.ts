/** Spider Solitaire sabitleri (tek renk, kolay mod). */

export const GAME_WIDTH = 510
export const GAME_HEIGHT = 700
export const GAME_PARENT_ID = 'game'

export const SUTUN_SAYISI = 10
export const KART_GENISLIK = 44
export const KART_YUKSEKLIK = 66
export const KART_ARALIK = 4
export const SUTUN_UST = 60
export const ACIK_KAYMA = 18
export const KAPALI_KAYMA = 7
export const DESTE_Y = 15

export const DIZI_PUANI = 300
export const HAMLE_CEZASI = 2
export const MIN_SKOR = 50

export const FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

export const COLORS = {
  BOARD: 0x1f1030,
  BOS: 0x33194d,
  KART: 0xf5f3ff,
  KART_ARKA: 0x6d28d9,
  SECILI: 0xfacc15,
  YAZI: '#1e1b4b',
} as const

export function skorHesapla(dizi: number, hamle: number): number {
  return Math.max(MIN_SKOR, dizi * DIZI_PUANI - hamle * HAMLE_CEZASI)
}
