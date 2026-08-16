/** Hafıza Kartları sabitleri. */

export const GAME_WIDTH = 510
export const GAME_HEIGHT = 510
export const BOARD_PADDING = 12
export const GAME_PARENT_ID = 'game'

export type Zorluk = 'kolay' | 'orta' | 'zor'

export interface ZorlukAyari {
  ad: string
  sutun: number
  satir: number
  tabanPuan: number
}

export const ZORLUKLAR: Record<Zorluk, ZorlukAyari> = {
  kolay: { ad: 'Kolay', sutun: 4, satir: 3, tabanPuan: 600 },
  orta: { ad: 'Orta', sutun: 4, satir: 5, tabanPuan: 1400 },
  zor: { ad: 'Zor', sutun: 6, satir: 6, tabanPuan: 3000 },
}

export const VARSAYILAN_ZORLUK: Zorluk = 'kolay'

/** Eşleşmeyen çiftin kapanması için bekleme (ms). */
export const KAPANMA_GECIKMESI = 700
export const CEVIRME_SURESI = 130

export const HAMLE_CEZASI = 10
export const SURE_BONUS_LIMITI = 300
export const MIN_SKOR = 100

export const FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

export const COLORS = {
  BOARD: 0x241a30,
  ARKA: 0x6b21a8,
  ON: 0xf3e8ff,
  ESLESEN: 0x86efac,
} as const

/** Kart yüzleri; her zorluk için yeterli çeşit var. */
export const SIMGELER = [
  '🐶','🐱','🦊','🐼','🐨','🐵','🦁','🐷','🐸','🐔','🦄','🐢',
  '🍎','🍌','🍇','🍓','🍒','🍉','🥕','🌽',
]

export function skorHesapla(zorluk: Zorluk, hamle: number, saniye: number): number {
  const taban = ZORLUKLAR[zorluk].tabanPuan
  const bonus = Math.max(0, SURE_BONUS_LIMITI - saniye)
  return Math.max(MIN_SKOR, taban + bonus - hamle * HAMLE_CEZASI)
}
