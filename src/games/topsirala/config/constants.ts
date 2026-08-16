/** Top Sıralama (renk ayırma) sabitleri. */

export const GAME_WIDTH = 510
export const GAME_HEIGHT = 430
export const GAME_PARENT_ID = 'game'

export type Zorluk = 'kolay' | 'orta' | 'zor'

export interface ZorlukAyari {
  ad: string
  renkSayisi: number
  /** Renk başına top (aynı zamanda tüp kapasitesi). */
  kapasite: number
  /** Fazladan boş tüp sayısı. */
  bosTup: number
  tabanPuan: number
}

export const ZORLUKLAR: Record<Zorluk, ZorlukAyari> = {
  kolay: { ad: 'Kolay', renkSayisi: 3, kapasite: 4, bosTup: 2, tabanPuan: 600 },
  orta: { ad: 'Orta', renkSayisi: 5, kapasite: 4, bosTup: 2, tabanPuan: 1400 },
  zor: { ad: 'Zor', renkSayisi: 7, kapasite: 4, bosTup: 2, tabanPuan: 2600 },
}

export const VARSAYILAN_ZORLUK: Zorluk = 'kolay'

export const TUP_GENISLIK = 46
export const TUP_KENAR = 4
export const TOP_YARICAP = 17
export const TOP_ARALIK = 38
export const TUP_ALT = 340
export const SECILI_YUKSEKLIK = 26
export const TASIMA_SURESI = 140

export const HAMLE_CEZASI = 6
export const MIN_SKOR = 100

export const COLORS = {
  TUP: 0x0e3a47,
  TUP_KENAR: 0x22d3ee,
  SECILI_KENAR: 0xfacc15,
} as const

export const TOP_RENKLERI = [
  0xef4444, 0x3b82f6, 0x22c55e, 0xeab308, 0xa855f7, 0xf97316, 0xec4899, 0x14b8a6,
]

export function skorHesapla(zorluk: Zorluk, hamle: number): number {
  return Math.max(MIN_SKOR, ZORLUKLAR[zorluk].tabanPuan - hamle * HAMLE_CEZASI)
}
