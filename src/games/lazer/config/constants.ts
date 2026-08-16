/** Laser Reflection sabitleri. Mantık ortak LazerAgi motorundan geliyor. */

export const GAME_WIDTH = 510
export const GAME_HEIGHT = 510
export const BOARD_PADDING = 14
export const GAME_PARENT_ID = 'game'

export type Zorluk = 'kolay' | 'orta' | 'zor'

export interface ZorlukAyari { ad: string; boyut: number; ayna: number; tabanPuan: number }

export const ZORLUKLAR: Record<Zorluk, ZorlukAyari> = {
  kolay: { ad: 'Kolay', boyut: 6, ayna: 4, tabanPuan: 700 },
  orta: { ad: 'Orta', boyut: 8, ayna: 7, tabanPuan: 1600 },
  zor: { ad: 'Zor', boyut: 10, ayna: 11, tabanPuan: 3000 },
}

export const VARSAYILAN_ZORLUK: Zorluk = 'kolay'

export const ISIN_KALINLIK = 4
export const HAMLE_CEZASI = 10
export const SURE_BONUS_LIMITI = 400
export const MIN_SKOR = 100
export const KAZANMA_BASLIGI = 'Lazeri hedeflere ulaştırdın! 🎉'

export const COLORS = {
  BOARD: 0x2b1113,
  HUCRE: 0x3d181b,
  ISIN: 0xf87171,
  AYNA: 0xfca5a5,
  HEDEF: 0x22c55e,
  HEDEF_VURULDU: 0xfacc15,
  KAYNAK: 0xffffff,
} as const

export function skorHesapla(z: Zorluk, hamle: number, saniye: number): number {
  return Math.max(MIN_SKOR, ZORLUKLAR[z].tabanPuan + Math.max(0, SURE_BONUS_LIMITI - saniye) - hamle * HAMLE_CEZASI)
}
