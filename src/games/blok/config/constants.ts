/** Blok Yerleştirme sabitleri. */

export const GAME_WIDTH = 510
export const GAME_HEIGHT = 700
export const BOARD_PADDING = 15
export const GAME_PARENT_ID = 'game'

export const BOYUT = 10
export const HUCRE = 46
export const TAHTA_UST = 15
export const ELDEKI_Y = 570
export const ELDEKI_HUCRE = 26
export const EL_SAYISI = 3

export const SATIR_PUANI = 100
export const HUCRE_PUANI = 5

export const COLORS = {
  BOARD: 0x1a1030,
  BOS: 0x2a1a4a,
  ONIZLEME: 0x6d28d9,
  SECILI_CERCEVE: 0xfacc15,
} as const

export const BLOK_RENKLERI = [0xa78bfa, 0xf472b6, 0x38bdf8, 0x4ade80, 0xfbbf24, 0xfb7185]

/** Parça şekilleri: [satır, sütun] göreli hücreler. */
export const SEKILLER: [number, number][][] = [
  [[0, 0]],
  [[0, 0], [0, 1]],
  [[0, 0], [1, 0]],
  [[0, 0], [0, 1], [0, 2]],
  [[0, 0], [1, 0], [2, 0]],
  [[0, 0], [0, 1], [1, 0], [1, 1]],
  [[0, 0], [0, 1], [1, 0]],
  [[0, 0], [0, 1], [1, 1]],
  [[0, 0], [1, 0], [1, 1]],
  [[0, 1], [1, 0], [1, 1]],
  [[0, 0], [0, 1], [0, 2], [0, 3]],
  [[0, 0], [1, 0], [2, 0], [3, 0]],
  [[0, 0], [0, 1], [0, 2], [1, 1]],
  [[0, 0], [1, 0], [2, 0], [1, 1]],
]
