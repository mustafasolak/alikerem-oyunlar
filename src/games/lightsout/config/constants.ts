/** Lights Out sabitleri. */

export const GAME_WIDTH = 510
export const GAME_HEIGHT = 510
export const BOARD_PADDING = 14
export const BOARD_RADIUS = 14
export const GAME_PARENT_ID = 'game'

export type Zorluk = 'kolay' | 'orta' | 'zor'

export interface ZorlukAyari {
  ad: string
  boyut: number
  /** Karıştırmak için uygulanan rastgele basış sayısı. */
  karistirma: number
  tabanPuan: number
}

export const ZORLUKLAR: Record<Zorluk, ZorlukAyari> = {
  kolay: { ad: 'Kolay', boyut: 3, karistirma: 4, tabanPuan: 400 },
  orta: { ad: 'Orta', boyut: 4, karistirma: 7, tabanPuan: 900 },
  zor: { ad: 'Zor', boyut: 5, karistirma: 12, tabanPuan: 1800 },
}

export const VARSAYILAN_ZORLUK: Zorluk = 'kolay'

export const HAMLE_CEZASI = 15
export const MIN_SKOR = 100
export const BASMA_SURESI = 120

export const COLORS = {
  BOARD: 0x241d10,
  ACIK: 0xfacc15,
  KAPALI: 0x3b3418,
  ACIK_KENAR: 0xfde68a,
} as const

export function skorHesapla(zorluk: Zorluk, hamle: number): number {
  return Math.max(MIN_SKOR, ZORLUKLAR[zorluk].tabanPuan - hamle * HAMLE_CEZASI)
}
