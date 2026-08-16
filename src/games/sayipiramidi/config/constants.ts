/** Sayı Piramidi sabitleri. */

export const GAME_WIDTH = 510
export const GAME_HEIGHT = 450
export const GAME_PARENT_ID = 'game'

export type Zorluk = 'kolay' | 'orta' | 'zor'

export interface ZorlukAyari { ad: string; kat: number; gizli: number; enBuyukTaban: number; tabanPuan: number }

export const ZORLUKLAR: Record<Zorluk, ZorlukAyari> = {
  kolay: { ad: 'Kolay', kat: 4, gizli: 4, enBuyukTaban: 9, tabanPuan: 600 },
  orta: { ad: 'Orta', kat: 5, gizli: 7, enBuyukTaban: 9, tabanPuan: 1400 },
  zor: { ad: 'Zor', kat: 6, gizli: 11, enBuyukTaban: 12, tabanPuan: 2600 },
}

export const VARSAYILAN_ZORLUK: Zorluk = 'kolay'

export const TAS_GENISLIK = 66
export const TAS_YUKSEKLIK = 46
export const TAS_ARALIK = 8
export const UST_BOSLUK = 20

export const HATA_CEZASI = 40
export const SURE_BONUS_LIMITI = 300
export const MIN_SKOR = 100

export const FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

export const COLORS = {
  BOARD: 0x2b1f0c,
  VERILEN: 0x4a3a17,
  BOS: 0x3a2c11,
  SECILI: 0xfbbf24,
  DOGRU: 0x65a30d,
  YAZI: '#fde68a',
  SECILI_YAZI: '#2b1f0c',
} as const

export function skorHesapla(z: Zorluk, hata: number, saniye: number): number {
  return Math.max(MIN_SKOR, ZORLUKLAR[z].tabanPuan + Math.max(0, SURE_BONUS_LIMITI - saniye) - hata * HATA_CEZASI)
}
