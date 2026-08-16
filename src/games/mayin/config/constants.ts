/** Mayın Tarlası sabitleri. */

export const GAME_WIDTH = 510
export const GAME_HEIGHT = 510
export const BOARD_PADDING = 8
export const BOARD_RADIUS = 14
export const CELL_GAP = 2
export const CELL_RADIUS = 4

export type Zorluk = 'kolay' | 'orta' | 'zor'

export interface ZorlukAyari {
  ad: string
  sutun: number
  satir: number
  mayin: number
  /** Kazanınca verilen taban puan. */
  tabanPuan: number
}

export const ZORLUKLAR: Record<Zorluk, ZorlukAyari> = {
  kolay: { ad: 'Kolay', sutun: 9, satir: 9, mayin: 10, tabanPuan: 500 },
  orta: { ad: 'Orta', sutun: 12, satir: 12, mayin: 25, tabanPuan: 1200 },
  zor: { ad: 'Zor', sutun: 16, satir: 16, mayin: 45, tabanPuan: 2500 },
}

export const VARSAYILAN_ZORLUK: Zorluk = 'kolay'

/** Hızlı bitirene ek puan: bu saniyenin altındaki her saniye için. */
export const SURE_BONUS_LIMITI = 300
export const SURE_BONUS_KATSAYI = 2

/** Dokunmatikte bayrak için basılı tutma süresi (ms). */
/** İki dokunuş bu süre içinde gelirse akor sayılır. */
export const AKOR_CIFT_TIK_MS = 400

export const UZUN_BASMA_MS = 420

export const ACILMA_SURESI = 90
export const PATLAMA_SARSINTI_MS = 260
export const PATLAMA_SARSINTI = 0.016

export const GAME_PARENT_ID = 'game'

export const FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

export const COLORS = {
  BOARD: 0x2a1c1c,
  KAPALI: 0x5b4038,
  KAPALI_ALT: 0x503630,
  ACIK: 0x33241f,
  MAYIN: 0xf65e3b,
  MAYIN_PATLAYAN: 0xff2d2d,
  BAYRAK: 0xfbbf24,
} as const

/** Komşu mayın sayısına göre rakam rengi (klasik palet). */
export const SAYI_RENKLERI: Record<number, string> = {
  1: '#60a5fa',
  2: '#4ade80',
  3: '#f87171',
  4: '#c084fc',
  5: '#fb923c',
  6: '#2dd4bf',
  7: '#e5e7eb',
  8: '#a1a1aa',
}

export function skorHesapla(zorluk: Zorluk, saniye: number): number {
  const bonus = Math.max(0, SURE_BONUS_LIMITI - saniye) * SURE_BONUS_KATSAYI
  return ZORLUKLAR[zorluk].tabanPuan + bonus
}
