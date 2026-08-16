/** Mantık Kapıları sabitleri. */

export const GAME_WIDTH = 510
export const GAME_HEIGHT = 510
export const GAME_PARENT_ID = 'game'

export type Zorluk = 'kolay' | 'orta' | 'zor'

export interface ZorlukAyari { ad: string; girisSayisi: number; kapiSayisi: number; tabanPuan: number }

export const ZORLUKLAR: Record<Zorluk, ZorlukAyari> = {
  kolay: { ad: 'Kolay', girisSayisi: 3, kapiSayisi: 2, tabanPuan: 600 },
  orta: { ad: 'Orta', girisSayisi: 4, kapiSayisi: 3, tabanPuan: 1400 },
  zor: { ad: 'Zor', girisSayisi: 5, kapiSayisi: 4, tabanPuan: 2600 },
}

export const VARSAYILAN_ZORLUK: Zorluk = 'kolay'

export const GIRIS_Y = 90
export const KAPI_BASLANGIC_Y = 210
export const KAPI_ARALIK_Y = 90
export const CIKIS_Y = 450
export const DUGME_YARICAP = 26

export const HAMLE_CEZASI = 25
export const MIN_SKOR = 100

export const FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

export const COLORS = {
  BOARD: 0x08222b,
  ACIK: 0x22d3ee,
  KAPALI: 0x134e5a,
  KAPI: 0x0e7490,
  KABLO_ACIK: 0x67e8f9,
  KABLO_KAPALI: 0x155e6b,
  YAZI: '#cffafe',
  KOYU_YAZI: '#08222b',
} as const

export function skorHesapla(z: Zorluk, hamle: number): number {
  return Math.max(MIN_SKOR, ZORLUKLAR[z].tabanPuan - hamle * HAMLE_CEZASI)
}
