/** Nonogram sabitleri. */

export const GAME_WIDTH = 510
export const GAME_HEIGHT = 510
export const GAME_PARENT_ID = 'game'
export const KENAR_ORAN = 0.26

export type Zorluk = 'kolay' | 'orta' | 'zor'

export interface ZorlukAyari { ad: string; boyut: number; doluluk: number; tabanPuan: number }

export const ZORLUKLAR: Record<Zorluk, ZorlukAyari> = {
  kolay: { ad: '5×5', boyut: 5, doluluk: 0.55, tabanPuan: 500 },
  orta: { ad: '10×10', boyut: 10, doluluk: 0.5, tabanPuan: 1500 },
  zor: { ad: '15×15', boyut: 15, doluluk: 0.48, tabanPuan: 3000 },
}

export const VARSAYILAN_ZORLUK: Zorluk = 'kolay'
export const UZUN_BASMA_MS = 380
export const HATA_CEZASI = 40
export const SURE_BONUS_LIMITI = 600
export const MIN_SKOR = 100

export const FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

export const COLORS = {
  BOARD: 0x2a1030,
  BOS: 0x3d1745,
  DOLU: 0xe879f9,
  CARPI: 0x2a1030,
  IPUCU_ZEMIN: 0x1f0b24,
  IPUCU_YAZI: '#f5d0fe',
  CARPI_YAZI: '#a855f7',
} as const

export function skorHesapla(z: Zorluk, hata: number, saniye: number): number {
  return Math.max(MIN_SKOR, ZORLUKLAR[z].tabanPuan + Math.max(0, SURE_BONUS_LIMITI - saniye) - hata * HATA_CEZASI)
}
