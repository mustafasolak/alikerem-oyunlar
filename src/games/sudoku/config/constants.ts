/** Sudoku sabitleri. */

export const BOYUT = 9
export const KUTU = 3
export const CELL = 54
export const BOARD_PADDING = 12
export const GAME_WIDTH = BOYUT * CELL + BOARD_PADDING * 2
export const GAME_HEIGHT = GAME_WIDTH
export const BOARD_RADIUS = 14

export type Zorluk = 'kolay' | 'orta' | 'zor'

export interface ZorlukAyari {
  ad: string
  /** Tahtada bırakılacak ipucu (dolu hücre) sayısı. */
  ipucu: number
  tabanPuan: number
}

export const ZORLUKLAR: Record<Zorluk, ZorlukAyari> = {
  kolay: { ad: 'Kolay', ipucu: 45, tabanPuan: 800 },
  orta: { ad: 'Orta', ipucu: 34, tabanPuan: 1600 },
  zor: { ad: 'Zor', ipucu: 28, tabanPuan: 3000 },
}

export const VARSAYILAN_ZORLUK: Zorluk = 'kolay'

export const SURE_BONUS_LIMITI = 900
export const HATA_CEZASI = 50
export const MIN_SKOR = 100

export const HATA_SARSINTI_MS = 140
export const HATA_SARSINTI = 0.005
export const TAMAMLAMA_POP_MS = 200

export const GAME_PARENT_ID = 'game'
export const FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
export const RAKAM_FONT = 30

/** Kalem notları: hücre içinde 3×3 küçük rakam ızgarası. */
export const NOT_FONT = 14
/** Rakamların sütunları hizalı dursun diye eş aralıklı yazı tipi. */
export const NOT_FONT_FAMILY = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
export const NOT_SATIR_ARALIGI = 2

export const COLORS = {
  BOARD: 0x152238,
  HUCRE: 0x1b2b45,
  HUCRE_VURGU: 0x24395c,
  HUCRE_SECILI: 0x2f5285,
  HUCRE_AYNI: 0x1f3454,
  KUTU_CIZGI: 0x0d1626,
  IPUCU_YAZI: '#cbd9ef',
  GIRILEN_YAZI: '#60a5fa',
  HATA_YAZI: '#f87171',
  NOT_YAZI: '#93b4e0',
} as const

export const IZGARA_INCE = 1
export const IZGARA_KALIN = 3

export function skorHesapla(zorluk: Zorluk, saniye: number, hata: number): number {
  const bonus = Math.max(0, SURE_BONUS_LIMITI - saniye)
  return Math.max(MIN_SKOR, ZORLUKLAR[zorluk].tabanPuan + bonus - hata * HATA_CEZASI)
}
