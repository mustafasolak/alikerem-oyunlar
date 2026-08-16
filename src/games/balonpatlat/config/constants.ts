/** Bubble Shooter sabitleri. */

export const GAME_WIDTH = 510
export const GAME_HEIGHT = 660
export const GAME_PARENT_ID = 'game'

export const SUTUN = 9
export const SATIR = 12
export const BALON_R = 24
export const ADIM_X = BALON_R * 2
export const ADIM_Y = BALON_R * 1.75
export const UST_BOSLUK = 26
/** Tek satırlar yarım hücre kaydığı için sağda pay bırakılır. */
export const SOL_BOSLUK = (GAME_WIDTH - (SUTUN * ADIM_X + BALON_R)) / 2

export const BASLANGIC_SATIR = 4
export const RENK_SAYISI = 5
export const ATIS_HAKKI = 30

export const ATICI_Y = 600
export const UCUS_SURESI = 240
export const PATLAMA_SURESI = 200
export const DUSME_SURESI = 320

export const BALON_PUANI = 20
export const KALAN_ATIS_PUANI = 30

export const COLORS = {
  BOARD: 0x082033,
  TAVAN: 0x123a56,
  ATICI: 0x1e3a5f,
  NISAN: 0xe2e8f0,
} as const

export const BALON_RENKLERI = [0xef4444, 0x3b82f6, 0x22c55e, 0xeab308, 0xa855f7]
