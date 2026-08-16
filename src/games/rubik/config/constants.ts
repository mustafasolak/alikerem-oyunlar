/** Rubik Küpü sabitleri. Açılmış (2B) görünüm. */

export const GAME_WIDTH = 510
export const GAME_HEIGHT = 400
export const GAME_PARENT_ID = 'game'

export const STICKER = 30
export const ARALIK = 3
export const YUZ_BOYU = STICKER * 3 + ARALIK * 2

export type Zorluk = 'kolay' | 'orta' | 'zor'
export const KARISTIRMA: Record<Zorluk, number> = { kolay: 4, orta: 10, zor: 20 }
export const ZORLUK_ADI: Record<Zorluk, string> = { kolay: 'Kolay', orta: 'Orta', zor: 'Zor' }
export const VARSAYILAN_ZORLUK: Zorluk = 'kolay'

export const TABAN_PUAN: Record<Zorluk, number> = { kolay: 700, orta: 1800, zor: 3500 }
export const HAMLE_CEZASI = 15
export const MIN_SKOR = 100

export const COLORS = {
  BOARD: 0x2b1607,
  BOS: 0x1a0d04,
} as const

/** Yüz renkleri: U, D, L, R, F, B */
export const YUZ_RENKLERI = [0xffffff, 0xfacc15, 0xfb923c, 0xef4444, 0x22c55e, 0x3b82f6]

export function skorHesapla(z: Zorluk, hamle: number): number {
  return Math.max(MIN_SKOR, TABAN_PUAN[z] - hamle * HAMLE_CEZASI)
}
