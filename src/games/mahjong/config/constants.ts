/** Mahjong sabitleri. Tek katmanlı, kenarı açık taş kuralıyla. */

export const GAME_WIDTH = 510
export const GAME_HEIGHT = 450
export const GAME_PARENT_ID = 'game'

export const SUTUN = 10
export const SATIR = 6
export const TAS_GENISLIK = 46
export const TAS_YUKSEKLIK = 62
export const UST_BOSLUK = 20

export const CIFT_PUANI = 120
export const SURE_BONUS_LIMITI = 300
export const MIN_SKOR = 100

export const FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

export const COLORS = {
  BOARD: 0x06231a,
  TAS: 0xecfdf5,
  TAS_KILITLI: 0x9ca3af,
  TAS_SECILI: 0x4ade80,
  YAZI: '#065f46',
} as const

export const SIMGELER = ['🀄','🎋','🌸','🍁','🐉','🦚','☀️','🌙','⭐','🔔','💠','🎐','🍀','🏮']

export function skorHesapla(cift: number, saniye: number): number {
  return Math.max(MIN_SKOR, cift * CIFT_PUANI + Math.max(0, SURE_BONUS_LIMITI - saniye))
}
