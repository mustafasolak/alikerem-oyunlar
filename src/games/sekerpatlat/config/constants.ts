/** Şeker Patlatma sabitleri. Mantık ortak UcluEslestirme motorundan geliyor. */

export const GAME_WIDTH = 510
export const GAME_HEIGHT = 510
export const BOARD_PADDING = 12
export const GAME_PARENT_ID = 'game'

export const BOYUT = 8
export const RENK_SAYISI = 6
export const BASLANGIC_HAMLE = 20
export const HEDEF_PUAN = 1000

export const PATLAMA_SURESI = 150
export const YUVARLAK = true

export const COLORS = {
  BOARD: 0x2b1119,
  HUCRE: 0x00000000 >>> 8,
  SECILI: 0xffffff,
} as const

export const TAS_RENKLERI = [0xfb7185, 0x60a5fa, 0x4ade80, 0xfbbf24, 0xc084fc, 0x2dd4bf]

export function skorHesapla(puan: number, kalanHamle: number): number {
  return puan + kalanHamle * 25
}
