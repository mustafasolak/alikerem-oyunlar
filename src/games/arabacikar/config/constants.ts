/** Araba Çıkarma (Rush Hour) sabitleri. */

export const GAME_WIDTH = 510
export const GAME_HEIGHT = 510
export const BOARD_PADDING = 15
export const GAME_PARENT_ID = 'game'

export const BOYUT = 6
/** Kırmızı arabanın çıkacağı satır. */
export const CIKIS_SATIR = 2

export const BOLUM_PUANI = 500
export const HAMLE_CEZASI = 8
export const MIN_SKOR = 80
export const KAYMA_SURESI = 110

export const COLORS = {
  BOARD: 0x241016,
  ZEMIN: 0x33161d,
  ZEMIN_ALT: 0x2c131a,
  CIKIS: 0xfacc15,
  SECILI: 0xffffff,
  CAM: 0xbfdbfe,
  TEKER: 0x111827,
  FAR: 0xfef3c7,
} as const

/** Hedef araç hep kırmızı; diğerleri sırayla bu renklerden. */
export const HEDEF_RENK = 0xef4444
export const ARAC_RENKLERI = [0x60a5fa, 0x34d399, 0xfbbf24, 0xa78bfa, 0xf472b6, 0x22d3ee, 0xfb923c]

/**
 * Bölümler. Her araç: [satır, sutun, uzunluk, yatayMi]
 * İlk araç her zaman kırmızı (çıkarılacak) araçtır ve yataydır.
 */
export const BOLUMLER: [number, number, number, boolean][][] = [
  // 1: tek dikey engel, aşağı kaydırınca yol açılır
  [
    [2, 0, 2, true],
    [0, 3, 3, false],
    [4, 0, 2, true],
  ],
  // 2: alttaki yatay aracı çekmeden dikey araç inemez
  [
    [2, 1, 2, true],
    [0, 4, 3, false],
    [0, 0, 2, true],
    [1, 0, 3, false],
    [5, 2, 3, true],
    [3, 5, 3, false],
  ],
  // 3: iki dikey engel birden inmeli
  [
    [2, 0, 2, true],
    [0, 2, 2, false],
    [0, 3, 2, true],
    [2, 3, 3, false],
    [5, 0, 3, true],
    [0, 5, 3, false],
  ],
  // 4: alt sıradaki kamyon yer açmadan olmaz
  [
    [2, 2, 2, true],
    [0, 0, 2, false],
    [2, 0, 2, false],
    [0, 2, 2, true],
    [1, 4, 3, false],
    [4, 0, 3, true],
    [5, 3, 3, true],
  ],
  // 5: en sıkışık düzen
  [
    [2, 1, 2, true],
    [0, 0, 3, true],
    [1, 0, 2, false],
    [0, 4, 3, false],
    [3, 1, 2, false],
    [3, 2, 2, true],
    [5, 0, 3, true],
    [4, 4, 2, true],
  ],
]

export function skorHesapla(bolum: number, hamle: number): number {
  return Math.max(MIN_SKOR, BOLUM_PUANI * bolum - hamle * HAMLE_CEZASI)
}
