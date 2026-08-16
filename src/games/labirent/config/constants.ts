/** Labirent sabitleri. */

export const GAME_WIDTH = 510
export const GAME_HEIGHT = 510
export const BOARD_PADDING = 10
export const GAME_PARENT_ID = 'game'
export const SWIPE_TARGET_ID = 'game-stage'

export type Zorluk = 'kolay' | 'orta' | 'zor'

export interface ZorlukAyari {
  ad: string
  boyut: number
  tabanPuan: number
}

export const ZORLUKLAR: Record<Zorluk, ZorlukAyari> = {
  kolay: { ad: 'Kolay', boyut: 9, tabanPuan: 600 },
  orta: { ad: 'Orta', boyut: 15, tabanPuan: 1400 },
  zor: { ad: 'Zor', boyut: 21, tabanPuan: 2600 },
}

export const VARSAYILAN_ZORLUK: Zorluk = 'kolay'

export const DUVAR_KALINLIK = 3
export const OYUNCU_ORAN = 0.34
export const HAREKET_SURESI = 90

export const SURE_BONUS_LIMITI = 300
export const HAMLE_CEZASI = 2
export const MIN_SKOR = 100

export const COLORS = {
  BOARD: 0x0b2b22,
  YOL: 0x113a2e,
  DUVAR: 0x34d399,
  OYUNCU: 0xfacc15,
  CIKIS: 0xf472b6,
  IZ: 0x1c5344,
} as const

export function skorHesapla(zorluk: Zorluk, hamle: number, saniye: number): number {
  const bonus = Math.max(0, SURE_BONUS_LIMITI - saniye)
  return Math.max(MIN_SKOR, ZORLUKLAR[zorluk].tabanPuan + bonus - hamle * HAMLE_CEZASI)
}
