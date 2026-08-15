/** Yılan için tüm ayarlanabilir değerler. Sihirli sayı başka dosyada olmasın. */

// --- Tahta ölçüleri (piksel, oyunun mantıksal çözünürlüğü) ---
export const GRID_COLS = 16
export const GRID_ROWS = 16
export const CELL_SIZE = 31
export const BOARD_PADDING = 7
export const GAME_WIDTH = GRID_COLS * CELL_SIZE + BOARD_PADDING * 2
export const GAME_HEIGHT = GRID_ROWS * CELL_SIZE + BOARD_PADDING * 2
export const BOARD_RADIUS = 14
/** Gövde parçası hücreden bu kadar içeri çekilir, aralarında boşluk kalsın diye. */
export const SEGMENT_INSET = 4
export const SEGMENT_RADIUS = 8
export const FOOD_RADIUS = CELL_SIZE * 0.3

// --- Oynanış kuralları ---
export const START_LENGTH = 3
export const SCORE_PER_FOOD = 10
/** Başlangıçtaki adım aralığı (ms). Küçüldükçe yılan hızlanır. */
export const STEP_START_MS = 150
export const STEP_MIN_MS = 70
/** Her yemde adım aralığından düşülen süre. */
export const STEP_SPEEDUP_MS = 3
/** Aynı anda kuyruğa alınabilecek dönüş sayısı (hızlı basışlar kaybolmasın). */
export const MAX_QUEUED_TURNS = 2
/** Sekme arka planda kalırsa biriken süre bununla sınırlanır. */
export const MAX_CATCH_UP_MS = 250

// --- Animasyon ---
export const FOOD_PULSE_MS = 520
export const FOOD_PULSE_SCALE = 1.18
export const EAT_POP_MS = 260
export const EAT_POP_SCALE = 2.4
export const DEATH_SHAKE_MS = 240
export const DEATH_SHAKE_INTENSITY = 0.014
export const OVERLAY_DELAY_MS = 320

// --- Girdi / DOM ---
export const SWIPE_TARGET_ID = 'game-stage'
export const GAME_PARENT_ID = 'game'

// --- Kayıt ---
export const STORAGE_BEST_KEY = 'oyunlar.yilan.best'

// --- Görsel ---
export const FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
export const READY_FONT_SIZE = 22

export const COLORS = {
  BOARD: 0x241f1a,
  GRID_LINE: 0x342c25,
  SNAKE_HEAD: 0xbef264,
  SNAKE_BODY: 0x84cc16,
  SNAKE_TAIL: 0x4d7c0f,
  FOOD: 0xf65e3b,
  EYE: 0x241f1a,
  READY_TEXT: '#a99e8f',
} as const

export const GRID_LINE_ALPHA = 0.55
export const EYE_RADIUS = 3.2
/** Gözlerin hücre merkezinden ileri ve yana kayma oranı. */
export const EYE_FORWARD = 0.16
export const EYE_SIDE = 0.18

/** İki rengi karıştırır; gövdenin baştan kuyruğa koyulaşması için. */
export function lerpColor(from: number, to: number, ratio: number): number {
  const t = Math.min(1, Math.max(0, ratio))
  const mix = (shift: number): number => {
    const a = (from >> shift) & 0xff
    const b = (to >> shift) & 0xff
    return Math.round(a + (b - a) * t)
  }
  return (mix(16) << 16) | (mix(8) << 8) | mix(0)
}
