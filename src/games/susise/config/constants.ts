/** Su Şişesi Renk Ayırma sabitleri. Mantık TopSirala motorundan geliyor. */

export const GAME_WIDTH = 510
export const GAME_HEIGHT = 430
export const GAME_PARENT_ID = 'game'

export type Zorluk = 'kolay' | 'orta' | 'zor'

export interface ZorlukAyari { ad: string; renkSayisi: number; kapasite: number; bosTup: number; tabanPuan: number }

export const ZORLUKLAR: Record<Zorluk, ZorlukAyari> = {
  kolay: { ad: 'Kolay', renkSayisi: 3, kapasite: 4, bosTup: 2, tabanPuan: 600 },
  orta: { ad: 'Orta', renkSayisi: 5, kapasite: 4, bosTup: 2, tabanPuan: 1400 },
  zor: { ad: 'Zor', renkSayisi: 7, kapasite: 4, bosTup: 2, tabanPuan: 2600 },
}

export const VARSAYILAN_ZORLUK: Zorluk = 'kolay'

export const KAP_GENISLIK = 48
export const KAP_KENAR = 4
export const PARCA_YUKSEKLIK = 34
export const KAP_ALT = 340
export const SECILI_YUKSEKLIK = 26
export const TASIMA_SURESI = 140
/** Görsel tema: 'su' katmanlı sıvı, 'kare' bloklar. */
export const TEMA: string = 'su'

export const HAMLE_CEZASI = 6
export const MIN_SKOR = 100

export const COLORS = {
  KAP: 0x11202b,
  KAP_KENAR: 0x64748b,
  SECILI_KENAR: 0xfacc15,
} as const

export const PARCA_RENKLERI = [0x38bdf8, 0xf472b6, 0x4ade80, 0xfacc15, 0xa78bfa, 0xfb7185, 0x2dd4bf, 0xfb923c]

export function skorHesapla(z: Zorluk, hamle: number): number {
  return Math.max(MIN_SKOR, ZORLUKLAR[z].tabanPuan - hamle * HAMLE_CEZASI)
}
