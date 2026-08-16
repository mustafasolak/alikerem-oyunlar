/** Mastermind sabitleri. */

export const GAME_WIDTH = 460
export const GAME_HEIGHT = 560
export const GAME_PARENT_ID = 'game'

export const UZUNLUK = 4
export const RENK_SAYISI = 6
export const MAX_DENEME = 10

export const SATIR_YUKSEKLIK = 44
export const TAHTA_UST = 14
export const TAS_YARICAP = 15
export const TAS_ARALIK = 42
export const TAHTA_SOL = 30
export const IPUCU_SOL = 240
export const IPUCU_YARICAP = 6
export const IPUCU_ARALIK = 16

export const PALET_Y = 505
export const PALET_YARICAP = 22
export const SIL_X = 400
export const ONAY_X = 60

export const TABAN_PUAN = 1500
export const DENEME_CEZASI = 100
export const MIN_SKOR = 100

export const FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

export const COLORS = {
  BOARD: 0x2b0f22,
  SATIR: 0x3d1730,
  TAM: 0xffffff,
  YAKIN: 0x9d174d,
  YAZI: '#f9a8d4',
} as const

export const TAS_RENKLERI = [0xef4444, 0xf59e0b, 0xfacc15, 0x4ade80, 0x38bdf8, 0xa78bfa]

export function skorHesapla(deneme: number): number {
  return Math.max(MIN_SKOR, TABAN_PUAN - (deneme - 1) * DENEME_CEZASI)
}
