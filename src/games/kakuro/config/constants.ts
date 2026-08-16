/** Kakuro sabitleri. */

export const GAME_WIDTH = 510
export const GAME_HEIGHT = 510
export const GAME_PARENT_ID = 'game'

export type Zorluk = 'kolay' | 'orta'

export interface ZorlukAyari { ad: string; boyut: number; tabanPuan: number }

export const ZORLUKLAR: Record<Zorluk, ZorlukAyari> = {
  kolay: { ad: 'Kolay', boyut: 5, tabanPuan: 900 },
  orta: { ad: 'Orta', boyut: 7, tabanPuan: 2000 },
}

export const VARSAYILAN_ZORLUK: Zorluk = 'kolay'

export const HATA_CEZASI = 40
export const SURE_BONUS_LIMITI = 500
export const MIN_SKOR = 100

export const FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

export const COLORS = {
  BOARD: 0x06240f,
  BOS: 0x0c3d1a,
  IPUCU: 0x052b12,
  SECILI: 0x4ade80,
  DOGRU: 0x166534,
  YAZI: '#dcfce7',
  KOYU_YAZI: '#06240f',
  IPUCU_YAZI: '#86efac',
} as const

export function skorHesapla(z: Zorluk, hata: number, saniye: number): number {
  return Math.max(MIN_SKOR, ZORLUKLAR[z].tabanPuan + Math.max(0, SURE_BONUS_LIMITI - saniye) - hata * HATA_CEZASI)
}
