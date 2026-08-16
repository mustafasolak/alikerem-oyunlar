/** Tetris sabitleri. */

export const COLS = 10
export const ROWS = 20
export const CELL = 26
export const PAD = 8
export const PANEL_W = 126

export const BOARD_W = COLS * CELL
export const BOARD_H = ROWS * CELL
export const GAME_WIDTH = PAD + BOARD_W + PAD + PANEL_W + PAD
export const GAME_HEIGHT = PAD + BOARD_H + PAD
export const BOARD_X = PAD
export const BOARD_Y = PAD
export const PANEL_X = PAD + BOARD_W + PAD

export const BLOCK_INSET = 2
export const BLOCK_RADIUS = 4
export const BOARD_RADIUS = 10

// --- Hız ---
/** 1. seviyedeki düşme aralığı (ms). */
export const DUSME_BASLANGIC_MS = 800
export const DUSME_MIN_MS = 90
/** Her seviyede düşme aralığından düşülen süre. */
export const DUSME_AZALMA_MS = 65
/** Kaç satırda bir seviye atlanır. */
export const SEVIYE_SATIR = 10
/** Sekme arka planda kalırsa biriken süre bununla sınırlanır. */
export const MAX_CATCH_UP_MS = 1000
/** Taş yere değdikten sonra kaydırmak için tanınan ek süre. */
export const KILIT_GECIKMESI_MS = 420

// --- Puan ---
export const SATIR_PUANLARI: Record<number, number> = { 1: 100, 2: 300, 3: 500, 4: 800 }
export const YUMUSAK_DUSUS_PUANI = 1
export const SERT_DUSUS_PUANI = 2

// --- Görsel ---
export const SATIR_TEMIZLEME_MS = 160
export const GAME_PARENT_ID = 'game'
export const SWIPE_TARGET_ID = 'game-stage'
export const FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
export const PANEL_FONT_SIZE = 13

export const COLORS = {
  BOARD: 0x16202a,
  IZGARA: 0x1e2c38,
  PANEL: 0x1a2530,
  HAYALET: 0x3d566b,
  YAZI: '#a9c0d0',
} as const

export type TasTipi = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z'

export const TAS_RENKLERI: Record<TasTipi, number> = {
  I: 0x22d3ee,
  J: 0x60a5fa,
  L: 0xfb923c,
  O: 0xfacc15,
  S: 0x4ade80,
  T: 0xc084fc,
  Z: 0xf87171,
}

/** Taş şekilleri; döndürme matrisi çevirerek yapılır. */
export const TAS_SEKILLERI: Record<TasTipi, number[][]> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
}

export const TAS_TIPLERI: TasTipi[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z']

/** Döndürme duvara denk gelirse denenecek yatay kaymalar. */
export const DUVAR_ITMELERI = [0, -1, 1, -2, 2]

export function dusmeAraligi(seviye: number): number {
  return Math.max(DUSME_MIN_MS, DUSME_BASLANGIC_MS - (seviye - 1) * DUSME_AZALMA_MS)
}
