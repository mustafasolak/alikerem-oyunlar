/** Kelime Bulmaca (çengel) sabitleri. */

export const GAME_WIDTH = 510
export const GAME_HEIGHT = 510
export const BOARD_PADDING = 10
export const BOARD_RADIUS = 14

/** Yerleştirme sırasında kullanılan çalışma ızgarası; sonra kırpılır. */
export const CALISMA_BOYUTU = 15
export const KELIME_SAYISI = 9
export const MIN_KELIME = 3
export const MAX_KELIME = 9

export const KELIME_PUANI = 200
export const SURE_BONUS_LIMITI = 900

export const GAME_PARENT_ID = 'game'
export const FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
/** Harf ve numara yazı boyutu hücre boyutunun oranı olarak hesaplanır. */
export const HARF_ORAN = 0.55
export const NUMARA_ORAN = 0.26

export const COLORS = {
  BOARD: 0x2a1526,
  HUCRE: 0xf3e8ef,
  HUCRE_AKTIF: 0xf9c8e2,
  HUCRE_SECILI: 0xf472b6,
  HARF: '#3b1030',
  NUMARA: '#8b5677',
  HARF_DOGRU: '#3b1030',
} as const

export function skorHesapla(cozulenKelime: number, saniye: number, tamamlandi: boolean): number {
  const taban = cozulenKelime * KELIME_PUANI
  return tamamlandi ? taban + Math.max(0, SURE_BONUS_LIMITI - saniye) : taban
}
