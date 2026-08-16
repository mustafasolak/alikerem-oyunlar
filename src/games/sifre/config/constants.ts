/** Şifre Çözme sabitleri. */

export const GAME_WIDTH = 510
export const GAME_HEIGHT = 550
export const GAME_PARENT_ID = 'game'

export const IPUCU_ORANI = 0.3

export const KUTU = 46
export const KUTU_ARALIK = 6
export const SATIR_Y = 140
export const SATIR_ARALIK = 84

export const TABAN_PUAN = 1500
export const HATA_CEZASI = 60
export const MIN_SKOR = 100

export const FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

export const COLORS = {
  BOARD: 0x1c1030,
  KUTU: 0x2e1a4a,
  KUTU_SECILI: 0xa78bfa,
  KUTU_VERILEN: 0x4c1d95,
  KUTU_DOGRU: 0x22c55e,
  YAZI: '#ede9fe',
  KOYU_YAZI: '#1c1030',
  NUMARA: '#c4b5fd',
} as const

export function skorHesapla(hata: number): number {
  return Math.max(MIN_SKOR, TABAN_PUAN - hata * HATA_CEZASI)
}
