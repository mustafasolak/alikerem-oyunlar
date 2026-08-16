/** Pentomino sabitleri. */

export const GAME_WIDTH = 510
export const GAME_HEIGHT = 700
export const GAME_PARENT_ID = 'game'

export type Zorluk = 'kolay' | 'orta'

export interface ZorlukAyari { ad: string; sutun: number; satir: number; parca: number; tabanPuan: number }

export const ZORLUKLAR: Record<Zorluk, ZorlukAyari> = {
  kolay: { ad: 'Kolay', sutun: 5, satir: 4, parca: 4, tabanPuan: 800 },
  orta: { ad: 'Orta', sutun: 6, satir: 5, parca: 6, tabanPuan: 1800 },
}

export const VARSAYILAN_ZORLUK: Zorluk = 'kolay'

export const HUCRE = 60
export const TAHTA_UST = 30
export const EL_Y = 500
export const EL_HUCRE = 22

export const SURE_BONUS_LIMITI = 400
export const MIN_SKOR = 100

export const COLORS = {
  BOARD: 0x1f1030,
  BOS: 0x33194d,
  SECILI_CERCEVE: 0xfacc15,
} as const

export const PARCA_RENKLERI = [0xc084fc, 0xf472b6, 0x38bdf8, 0x4ade80, 0xfbbf24, 0xfb7185, 0x2dd4bf]

export function skorHesapla(z: Zorluk, saniye: number): number {
  return Math.max(MIN_SKOR, ZORLUKLAR[z].tabanPuan + Math.max(0, SURE_BONUS_LIMITI - saniye))
}
