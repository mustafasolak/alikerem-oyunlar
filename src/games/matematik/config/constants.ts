/** Matematik Bulmacası (hedefe ulaşma) sabitleri. */

export const GAME_WIDTH = 510
export const GAME_HEIGHT = 510
export const GAME_PARENT_ID = 'game'

export type Zorluk = 'kolay' | 'orta' | 'zor'

export interface ZorlukAyari { ad: string; sayiAdedi: number; enBuyuk: number; adim: number; tabanPuan: number }

export const ZORLUKLAR: Record<Zorluk, ZorlukAyari> = {
  kolay: { ad: 'Kolay', sayiAdedi: 4, enBuyuk: 9, adim: 3, tabanPuan: 600 },
  orta: { ad: 'Orta', sayiAdedi: 5, enBuyuk: 12, adim: 4, tabanPuan: 1400 },
  zor: { ad: 'Zor', sayiAdedi: 6, enBuyuk: 15, adim: 5, tabanPuan: 2600 },
}

export const VARSAYILAN_ZORLUK: Zorluk = 'kolay'

export const SAYI_YARICAP = 40
export const SAYI_Y = 200
export const ISLEM_Y = 340
export const ISLEM_YARICAP = 32
export const HEDEF_Y = 70

export const HAMLE_CEZASI = 20
export const MIN_SKOR = 100

export const FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

export const COLORS = {
  BOARD: 0x0f1e33,
  SAYI: 0x1e3a5f,
  SECILI: 0x60a5fa,
  ISLEM: 0x1e40af,
  ISLEM_SECILI: 0x93c5fd,
  YAZI: '#dbeafe',
  KOYU_YAZI: '#0f1e33',
} as const

export const ISLEMLER = ['+', '-', '×', '÷'] as const

export function skorHesapla(z: Zorluk, hamle: number): number {
  return Math.max(MIN_SKOR, ZORLUKLAR[z].tabanPuan - hamle * HAMLE_CEZASI)
}
