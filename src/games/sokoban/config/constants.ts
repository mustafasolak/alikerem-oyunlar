/** Sokoban sabitleri. */

export const GAME_WIDTH = 510
export const GAME_HEIGHT = 510
export const BOARD_PADDING = 12
export const GAME_PARENT_ID = 'game'
export const SWIPE_TARGET_ID = 'game-stage'

export const HAREKET_SURESI = 90
export const BOLUM_PUANI = 400
export const HAMLE_CEZASI = 4
export const MIN_SKOR = 50

export const COLORS = {
  BOARD: 0x2b1a0e,
  ZEMIN: 0x4a3520,
  DUVAR: 0x7c4a21,
  HEDEF: 0xfb923c,
  KUTU: 0xd97706,
  KUTU_YERINDE: 0x65a30d,
  OYUNCU: 0xfde68a,
} as const

/**
 * Bölümler. Karakterler:
 *  '#' duvar · ' ' boş · '@' oyuncu · '$' kutu · '.' hedef · '*' hedefteki kutu · '+' hedefteki oyuncu
 */
export const BOLUMLER: string[][] = [
  [
    '#######',
    '#     #',
    '# .$@ #',
    '#     #',
    '#######',
  ],
  [
    '########',
    '#      #',
    '# .$   #',
    '#  $.  #',
    '#   @  #',
    '########',
  ],
  [
    '########',
    '#  .   #',
    '# #$## #',
    '# $ @  #',
    '#  .   #',
    '########',
  ],
  [
    '#########',
    '#   .   #',
    '#  ###  #',
    '# $ @ $ #',
    '#  ###  #',
    '#   .   #',
    '#########',
  ],
  [
    '##########',
    '#        #',
    '#  ..    #',
    '#  $$    #',
    '#   @    #',
    '#     #  #',
    '##########',
  ],
]

export function skorHesapla(bolum: number, hamle: number): number {
  return Math.max(MIN_SKOR, BOLUM_PUANI * bolum - hamle * HAMLE_CEZASI)
}
