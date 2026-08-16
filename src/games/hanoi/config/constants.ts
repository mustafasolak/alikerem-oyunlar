/** Hanoi Kuleleri sabitleri. */

export const GAME_WIDTH = 510
export const GAME_HEIGHT = 420
export const GAME_PARENT_ID = 'game'

export const CUBUK_SAYISI = 3
export const MIN_DISK = 3
export const MAX_DISK = 6
export const VARSAYILAN_DISK = 3

export const TABAN_Y = 350
export const TABAN_YUKSEKLIK = 12
export const CUBUK_GENISLIK = 10
export const CUBUK_YUKSEKLIK = 210
export const DISK_YUKSEKLIK = 26
export const DISK_MIN_GENISLIK = 60
export const DISK_ADIM = 26
export const DISK_RADIUS = 8
export const TASIMA_SURESI = 130
export const SECILI_YUKSEKLIK = 40

export const TABAN_PUAN = 1200
export const FAZLA_HAMLE_CEZASI = 40
export const MIN_SKOR = 100

export const FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

export const COLORS = {
  TABAN: 0x0c4a6e,
  CUBUK: 0x075985,
  VURGU: 0x38bdf8,
  YAZI: '#bae6fd',
} as const

/** Disk renkleri; en büyükten en küçüğe. */
export const DISK_RENKLERI = [0x0ea5e9, 0x38bdf8, 0x22d3ee, 0x34d399, 0xa3e635, 0xfacc15]

export const enAzHamle = (diskSayisi: number): number => Math.pow(2, diskSayisi) - 1

export function skorHesapla(diskSayisi: number, hamle: number): number {
  const fazla = Math.max(0, hamle - enAzHamle(diskSayisi))
  return Math.max(MIN_SKOR, TABAN_PUAN * (diskSayisi - 2) - fazla * FAZLA_HAMLE_CEZASI)
}
