/** Elektrik Devresi sabitleri. Mantık ortak BoruAgi motorundan geliyor. */

export const GAME_WIDTH = 510
export const GAME_HEIGHT = 510
export const BOARD_PADDING = 12
export const GAME_PARENT_ID = 'game'

export type Zorluk = 'kolay' | 'orta' | 'zor'

export interface ZorlukAyari { ad: string; boyut: number; tabanPuan: number }

export const ZORLUKLAR: Record<Zorluk, ZorlukAyari> = {
  kolay: { ad: 'Kolay', boyut: 5, tabanPuan: 700 },
  orta: { ad: 'Orta', boyut: 7, tabanPuan: 1600 },
  zor: { ad: 'Zor', boyut: 9, tabanPuan: 3000 },
}

export const VARSAYILAN_ZORLUK: Zorluk = 'kolay'

/** Uç noktalarda gösterilen simge. */
export const UC_SIMGESI = '💡'
export const KOL_KALINLIK_ORAN = 0.26
export const DONME_SURESI = 110
export const HAMLE_CEZASI = 6
export const SURE_BONUS_LIMITI = 400
export const MIN_SKOR = 100
export const KAZANMA_BASLIGI = 'Devre tamamlandı! 🎉'

export const COLORS = {
  BOARD: 0x2b2205,
  HUCRE: 0x40340a,
  AKTIF: 0xfacc15,
  PASIF: 0xa16207,
  KAYNAK: 0xf87171,
} as const

export function skorHesapla(z: Zorluk, hamle: number, saniye: number): number {
  return Math.max(MIN_SKOR, ZORLUKLAR[z].tabanPuan + Math.max(0, SURE_BONUS_LIMITI - saniye) - hamle * HAMLE_CEZASI)
}
