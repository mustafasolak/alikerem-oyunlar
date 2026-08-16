/** Match-3 sabitleri. Mantık ortak UcluEslestirme motorundan geliyor. */

export const GAME_WIDTH = 510
export const GAME_HEIGHT = 510
export const BOARD_PADDING = 12
export const GAME_PARENT_ID = 'game'

export const BOYUT = 8
export const RENK_SAYISI = 6
export const BASLANGIC_HAMLE = 20
export const HEDEF_PUAN = 1000

export const PATLAMA_SURESI = 150
export const YUVARLAK = false

export const COLORS = {
  BOARD: 0x2b0f22,
  HUCRE: 0x00000000 >>> 8,
  SECILI: 0xffffff,
} as const

export const TAS_RENKLERI = [0xef4444, 0x3b82f6, 0x22c55e, 0xeab308, 0xa855f7, 0xf97316]

export function skorHesapla(puan: number, kalanHamle: number): number {
  return puan + kalanHamle * 25
}
