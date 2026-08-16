/** Box Push sabitleri. Mantık Sokoban motorundan geliyor, bölümler farklı. */

export const GAME_WIDTH = 510
export const GAME_HEIGHT = 510
export const BOARD_PADDING = 12
export const GAME_PARENT_ID = 'game'
export const SWIPE_TARGET_ID = 'game-stage'

export const HAREKET_SURESI = 90
export const BOLUM_PUANI = 450
export const HAMLE_CEZASI = 4
export const MIN_SKOR = 50

export const COLORS = {
  BOARD: 0x1b2129,
  ZEMIN: 0x2b3440,
  DUVAR: 0x5b6876,
  HEDEF: 0x38bdf8,
  KUTU: 0x94a3b8,
  KUTU_YERINDE: 0x22c55e,
  OYUNCU: 0xfacc15,
} as const

/** '#' duvar · '@' oyuncu · '$' kutu · '.' hedef · '*' hedefteki kutu */
export const BOLUMLER: string[][] = [
  [
    '#######',
    '#  .  #',
    '#  $  #',
    '#  @  #',
    '#######',
  ],
  [
    '########',
    '#.     #',
    '#  $   #',
    '#   @  #',
    '#     .#',
    '#   $  #',
    '########',
  ],
  [
    '#########',
    '#  ...  #',
    '# ##### #',
    '# $$$   #',
    '#   @   #',
    '#########',
  ],
  [
    '#########',
    '#   #   #',
    '# . # . #',
    '# $ # $ #',
    '#   @   #',
    '#########',
  ],
  [
    '##########',
    '#....    #',
    '#$$$$    #',
    '#    @   #',
    '#        #',
    '##########',
  ],
  [
    '##########',
    '#  #     #',
    '# .#. .  #',
    '# $ $ $  #',
    '#   @    #',
    '#   #    #',
    '##########',
  ],
]

export function skorHesapla(bolum: number, hamle: number): number {
  return Math.max(MIN_SKOR, BOLUM_PUANI * bolum - hamle * HAMLE_CEZASI)
}
