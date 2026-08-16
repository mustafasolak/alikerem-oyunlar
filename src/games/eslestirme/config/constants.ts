/** Eşleştirme Oyunu sabitleri. */

export const GAME_WIDTH = 510
export const GAME_HEIGHT = 510
export const GAME_PARENT_ID = 'game'

export const CIFT_SAYISI = 6
export const KART_GENISLIK = 210
export const KART_YUKSEKLIK = 62
export const KART_ARALIK = 12
export const UST_BOSLUK = 24
export const SOL_X = 130
export const SAG_X = 380

export const TABAN_PUAN = 1200
export const HATA_CEZASI = 60
export const SURE_BONUS_LIMITI = 240
export const MIN_SKOR = 100

export const FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
export const YAZI_BOYU = 16

export const COLORS = {
  BOARD: 0x2b1119,
  KART: 0x4a1b28,
  SECILI: 0xfb7185,
  ESLESEN: 0x22c55e,
  YAZI: '#ffe4e6',
} as const

/** Eşleştirilecek ikililer. */
export const IKILILER: [string, string][] = [
  ['Türkiye', 'Ankara'],
  ['Fransa', 'Paris'],
  ['Japonya', 'Tokyo'],
  ['İtalya', 'Roma'],
  ['Almanya', 'Berlin'],
  ['İspanya', 'Madrid'],
  ['Kedi', 'Yavru kedi'],
  ['Koyun', 'Kuzu'],
  ['İnek', 'Buzağı'],
  ['At', 'Tay'],
  ['Tavuk', 'Civciv'],
  ['Kelebek', 'Tırtıl'],
  ['Su', 'H₂O'],
  ['Güneş', 'Yıldız'],
  ['Ay', 'Uydu'],
  ['Balık', 'Solungaç'],
  ['Kuş', 'Kanat'],
  ['Ağaç', 'Yaprak'],
]

export function skorHesapla(hata: number, saniye: number): number {
  return Math.max(MIN_SKOR, TABAN_PUAN + Math.max(0, SURE_BONUS_LIMITI - saniye) - hata * HATA_CEZASI)
}
