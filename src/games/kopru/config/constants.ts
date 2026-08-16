/** Köprü Kurma (Hashi) sabitleri. */

export const GAME_WIDTH = 510
export const GAME_HEIGHT = 510
export const BOARD_PADDING = 22
export const GAME_PARENT_ID = 'game'

export type Zorluk = 'kolay' | 'orta' | 'zor'

export interface ZorlukAyari { ad: string; boyut: number; ada: number; tabanPuan: number }

export const ZORLUKLAR: Record<Zorluk, ZorlukAyari> = {
  kolay: { ad: 'Kolay', boyut: 6, ada: 7, tabanPuan: 700 },
  orta: { ad: 'Orta', boyut: 8, ada: 11, tabanPuan: 1600 },
  zor: { ad: 'Zor', boyut: 10, ada: 16, tabanPuan: 3000 },
}

export const VARSAYILAN_ZORLUK: Zorluk = 'kolay'

export const ADA_ORAN = 0.34
export const KOPRU_KALINLIK = 3
export const KOPRU_ARALIK = 5

export const SURE_BONUS_LIMITI = 400
export const MIN_SKOR = 100

export const FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

export const COLORS = {
  BOARD: 0x061e2b,
  ADA: 0x0e3a52,
  ADA_TAMAM: 0x22c55e,
  ADA_FAZLA: 0xef4444,
  KOPRU: 0x38bdf8,
  YAZI: '#e0f2fe',
} as const

export function skorHesapla(z: Zorluk, saniye: number): number {
  return Math.max(MIN_SKOR, ZORLUKLAR[z].tabanPuan + Math.max(0, SURE_BONUS_LIMITI - saniye))
}
