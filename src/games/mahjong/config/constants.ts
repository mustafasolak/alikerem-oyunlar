/**
 * Mahjong sabitleri — katmanlı (üst üste binen) taş düzeni.
 *
 * Taşlar ortak bir ızgarada durur: bir taşın "üstü" aynı satır/sütundaki bir
 * üst kat taşıdır. Böylece kapalılık denetimi tek karşılaştırmaya iner.
 */

export const GAME_WIDTH = 510
export const GAME_HEIGHT = 470
export const GAME_PARENT_ID = 'game'

export const SUTUN = 8
export const SATIR = 5

export const TAS_GENISLIK = 54
export const TAS_YUKSEKLIK = 70
export const UST_BOSLUK = 24

/** Üst kat taşları bu kadar kaydırılarak çizilir; derinlik böyle okunuyor. */
export const KAT_KAYMA_X = 9
export const KAT_KAYMA_Y = 11

/**
 * Kat düzeni: her kat için doldurulacak hücreler.
 * Üst katlar ortaya doğru daralır — klasik piramit görüntüsü.
 * Toplam taş sayısı çift olmalı (eşleşme oyunu).
 */
export interface KatTanimi {
  satirlar: number[]
  sutunlar: number[]
}

export const KATLAR: KatTanimi[] = [
  { satirlar: [0, 1, 2, 3, 4], sutunlar: [0, 1, 2, 3, 4, 5, 6, 7] }, // 40
  { satirlar: [1, 2, 3], sutunlar: [1, 2, 3, 4, 5, 6] }, // 18
  { satirlar: [2], sutunlar: [2, 3, 4, 5] }, // 4
]

export const CIFT_PUANI = 120
export const SURE_BONUS_LIMITI = 300
export const MIN_SKOR = 100

export const SECIM_BUYUME = 1.08
export const ESLESME_SURESI = 190

export const FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
export const SIMGE_FONT = 30

export const COLORS = {
  BOARD: 0x06231a,
  /** Kat yükseldikçe taş biraz daha açık: yükseklik hissi. */
  TAS: [0xcfe8db, 0xe6f5ec, 0xfbfffd] as const,
  TAS_KENAR: 0x2f6b52,
  /** Taşın yan yüzü: kalınlık hissi. */
  TAS_YAN: [0x8fb9a4, 0xa3c9b3, 0xb8d9c5] as const,
  TAS_KAPALI: 0x7d8c85,
  TAS_SECILI: 0x22c55e,
  TAS_IPUCU: 0xfacc15,
  GOLGE: 0x03150f,
  YAZI: '#0b3b2b',
  YAZI_KAPALI: '#5b6b63',
} as const

export const SIMGELER = ['🀄', '🎋', '🌸', '🍁', '🐉', '🦚', '☀️', '🌙', '⭐', '🔔', '💠', '🎐', '🍀', '🏮']

export function skorHesapla(cift: number, saniye: number): number {
  return Math.max(MIN_SKOR, cift * CIFT_PUANI + Math.max(0, SURE_BONUS_LIMITI - saniye))
}
