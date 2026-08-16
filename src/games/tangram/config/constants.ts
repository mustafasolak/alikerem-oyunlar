/** Tangram sabitleri. Parça yerleştirme mantığı Pentomino motorundan geliyor. */

export const GAME_WIDTH = 510
export const GAME_HEIGHT = 700
export const GAME_PARENT_ID = 'game'

export type Zorluk = 'kolay' | 'orta'

export interface ZorlukAyari { ad: string; sutun: number; satir: number; parca: number; tabanPuan: number }

export const ZORLUKLAR: Record<Zorluk, ZorlukAyari> = {
  kolay: { ad: 'Kolay', sutun: 4, satir: 4, parca: 4, tabanPuan: 700 },
  orta: { ad: 'Orta', sutun: 6, satir: 4, parca: 5, tabanPuan: 1500 },
}

export const VARSAYILAN_ZORLUK: Zorluk = 'kolay'

export const HUCRE = 70
export const TAHTA_UST = 40
export const EL_Y = 520
export const EL_HUCRE = 26

export const SURE_BONUS_LIMITI = 300
export const MIN_SKOR = 100

export const COLORS = {
  BOARD: 0x2b1607,
  BOS: 0x40230c,
  SECILI_CERCEVE: 0xfacc15,
} as const

export const PARCA_RENKLERI = [0xfb923c, 0xfacc15, 0xf87171, 0x38bdf8, 0x4ade80, 0xc084fc]

export function skorHesapla(z: Zorluk, saniye: number): number {
  return Math.max(MIN_SKOR, ZORLUKLAR[z].tabanPuan + Math.max(0, SURE_BONUS_LIMITI - saniye))
}
