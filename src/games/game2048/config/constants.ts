/** 2048 için tüm ayarlanabilir değerler. Sihirli sayı başka dosyada olmasın. */

// --- Tahta ölçüleri (piksel, oyunun mantıksal çözünürlüğü) ---
export const GRID_SIZE = 4
export const CELL_SIZE = 110
export const CELL_GAP = 14
export const BOARD_PADDING = CELL_GAP
export const BOARD_SIZE = GRID_SIZE * CELL_SIZE + (GRID_SIZE + 1) * CELL_GAP
export const GAME_WIDTH = BOARD_SIZE
export const GAME_HEIGHT = BOARD_SIZE
export const BOARD_RADIUS = 14
export const TILE_RADIUS = 10

// --- Oynanış kuralları ---
export const WINNING_VALUE = 2048
export const START_TILE_COUNT = 2

/**
 * Oyun başına geri alma hakkı. Sınırsız olsaydı skor tablosu anlamını
 * yitirirdi; üç hak yanlış kaydırmayı telafi etmeye yetiyor.
 */
export const GERI_ALMA_HAKKI = 3
export const SPAWN_VALUE_LOW = 2
export const SPAWN_VALUE_HIGH = 4
/** Yeni karenin 4 gelme olasılığı. */
export const SPAWN_FOUR_CHANCE = 0.1

// --- Animasyon süreleri (ms) ---
export const MOVE_DURATION = 110
export const SPAWN_DURATION = 130
export const MERGE_POP_DURATION = 110
export const MERGE_POP_SCALE = 1.18
/** Bir hamlenin tüm animasyonlarının tamamlanma süresi. */
export const TURN_DURATION = MOVE_DURATION + Math.max(SPAWN_DURATION, MERGE_POP_DURATION)

// --- Girdi ---
/** Parmak kaydırmasının dinlendiği DOM elemanı. */
export const SWIPE_TARGET_ID = 'game-stage'
/** Phaser tuvalinin yerleştirileceği DOM elemanı. */
export const GAME_PARENT_ID = 'game'

// --- Kayıt ---
/** Skor tablosu anahtarı Leaderboard tarafından oyun kimliğinden üretilir. */
export const STORAGE_GAME_KEY = 'oyunlar.2048.save'

// --- Görsel ---
export const FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

export const COLORS = {
  BOARD: 0xbbada0,
  EMPTY_CELL: 0xcdc1b4,
  TEXT_DARK: '#776e65',
  TEXT_LIGHT: '#f9f6f2',
} as const

export interface TileStyle {
  fill: number
  text: string
}

/** Klasik 2048 paleti. Tabloda olmayan değerler DEFAULT_TILE_STYLE kullanır. */
export const TILE_STYLES: Record<number, TileStyle> = {
  2: { fill: 0xeee4da, text: COLORS.TEXT_DARK },
  4: { fill: 0xede0c8, text: COLORS.TEXT_DARK },
  8: { fill: 0xf2b179, text: COLORS.TEXT_LIGHT },
  16: { fill: 0xf59563, text: COLORS.TEXT_LIGHT },
  32: { fill: 0xf67c5f, text: COLORS.TEXT_LIGHT },
  64: { fill: 0xf65e3b, text: COLORS.TEXT_LIGHT },
  128: { fill: 0xedcf72, text: COLORS.TEXT_LIGHT },
  256: { fill: 0xedcc61, text: COLORS.TEXT_LIGHT },
  512: { fill: 0xedc850, text: COLORS.TEXT_LIGHT },
  1024: { fill: 0xedc53f, text: COLORS.TEXT_LIGHT },
  2048: { fill: 0xedc22e, text: COLORS.TEXT_LIGHT },
}

export const DEFAULT_TILE_STYLE: TileStyle = { fill: 0x3c3a32, text: COLORS.TEXT_LIGHT }

/** Basamak sayısı arttıkça yazı küçülür. */
export const FONT_SIZE_BY_DIGITS: Record<number, number> = {
  1: 52,
  2: 52,
  3: 44,
  4: 36,
}
export const FONT_SIZE_MIN = 28

export function tileStyleFor(value: number): TileStyle {
  return TILE_STYLES[value] ?? DEFAULT_TILE_STYLE
}

export function fontSizeFor(value: number): number {
  return FONT_SIZE_BY_DIGITS[String(value).length] ?? FONT_SIZE_MIN
}
