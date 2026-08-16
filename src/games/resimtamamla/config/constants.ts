/** Resim Tamamlama sabitleri. Desen kodla üretiliyor. */

export const GAME_WIDTH = 510
export const GAME_HEIGHT = 700
export const GAME_PARENT_ID = 'game'

export const BOYUT = 6
export const HUCRE = 70
export const TAHTA_UST = 30
export const SECENEK_SAYISI = 4
export const SECENEK_Y = 560
export const SECENEK_HUCRE = 34
export const TUR_SAYISI = 5

export const TUR_PUANI = 300
export const HATA_CEZASI = 80
export const MIN_SKOR = 100

export const COLORS = {
  BOARD: 0x08243a,
  EKSIK: 0x0e3a5c,
  SECENEK_CERCEVE: 0x38bdf8,
} as const

export const DESEN_RENKLERI = [0x38bdf8, 0xfbbf24, 0xf472b6, 0x4ade80, 0xa78bfa, 0xfb7185]

export function skorHesapla(tur: number, hata: number): number {
  return Math.max(MIN_SKOR, tur * TUR_PUANI - hata * HATA_CEZASI)
}
