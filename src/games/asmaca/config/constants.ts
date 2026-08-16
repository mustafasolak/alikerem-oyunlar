/** Adam Asmaca sabitleri. */

export const GAME_WIDTH = 510
export const GAME_HEIGHT = 560

export const MAX_CAN = 6
export const MIN_KELIME = 4
export const MAX_KELIME = 9

// Skor: az yanlışla ve uzun kelimeyle bitiren yüksek alır.
export const CAN_PUANI = 100
export const HARF_PUANI = 25

export const GAME_PARENT_ID = 'game'
export const FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

// --- Darağacı çizimi ---
export const CIZGI_KALINLIK = 6
/** Ölçüler tuvalin ortasına oturacak şekilde seçildi (taban merkezi ≈ 255). */
export const DARAGACI = {
  tabanY: 340,
  tabanSolX: 160,
  tabanSagX: 355,
  direkX: 200,
  direkUstY: 60,
  kolSagX: 335,
  ipUzunluk: 40,
} as const

export const KAFA_YARICAP = 26
export const GOVDE_UZUNLUK: number = 80
export const KOL_UZUNLUK = 42
export const BACAK_UZUNLUK = 46

// --- Kelime alanı ---
export const HARF_Y = 430
export const HARF_GENISLIK = 40
export const HARF_ARALIK = 8
export const HARF_FONT = 30
export const KATEGORI_Y = 490
export const KATEGORI_FONT = 17

export const PARCA_BELIRME_MS = 180

export const COLORS = {
  DARAGACI: 0x8b5e34,
  ADAM: 0xfbbf24,
  CIZGI: 0x6b5642,
  HARF_YAZI: '#f6efe4',
  GIZLI_YAZI: '#6b5642',
  KATEGORI: '#a99e8f',
  KAYIP: '#f87171',
} as const

export function skorHesapla(kalanCan: number, kelimeUzunlugu: number): number {
  return kalanCan * CAN_PUANI + kelimeUzunlugu * HARF_PUANI
}
