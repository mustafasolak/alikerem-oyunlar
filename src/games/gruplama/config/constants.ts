/** Kelime Gruplama sabitleri. */

export const GAME_WIDTH = 510
export const GAME_HEIGHT = 550
export const GAME_PARENT_ID = 'game'

export const GRUP_SAYISI = 4
export const GRUP_BOYU = 4
export const MAX_HATA = 3

export const KART_GENISLIK = 116
export const KART_YUKSEKLIK = 66
export const KART_ARALIK = 8
export const UST_BOSLUK = 20
export const DENE_Y = 470

export const TABAN_PUAN = 1600
export const HATA_CEZASI = 250
export const MIN_SKOR = 100

export const FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

export const COLORS = {
  BOARD: 0x2b2205,
  KART: 0x453409,
  SECILI: 0xfacc15,
  DENE: 0x7c5c0a,
  YAZI: '#fef3c7',
  KOYU_YAZI: '#2b2205',
} as const

/** Grup renkleri: çözülen gruplar bu renkle gösterilir. */
export const GRUP_RENKLERI = [0x84cc16, 0x38bdf8, 0xf472b6, 0xfb923c]

export interface GrupTanimi {
  baslik: string
  kelimeler: [string, string, string, string]
}

/** Her tur bu havuzdan dört grup seçilir. */
export const GRUPLAR: GrupTanimi[] = [
  { baslik: 'Meyveler', kelimeler: ['ELMA', 'ARMUT', 'KİRAZ', 'ÜZÜM'] },
  { baslik: 'Şehirler', kelimeler: ['BURSA', 'KONYA', 'ADANA', 'RİZE'] },
  { baslik: 'Renkler', kelimeler: ['MAVİ', 'YEŞİL', 'SARI', 'MOR'] },
  { baslik: 'Hayvanlar', kelimeler: ['ASLAN', 'KAPLAN', 'ZÜRAFA', 'TİLKİ'] },
  { baslik: 'Meslekler', kelimeler: ['DOKTOR', 'PİLOT', 'TERZİ', 'AŞÇI'] },
  { baslik: 'Mevsimler', kelimeler: ['KIŞ', 'YAZ', 'BAHAR', 'GÜZ'] },
  { baslik: 'Gezegenler', kelimeler: ['MARS', 'VENÜS', 'SATÜRN', 'JÜPİTER'] },
  { baslik: 'Müzik aletleri', kelimeler: ['DAVUL', 'GİTAR', 'KEMAN', 'FLÜT'] },
  { baslik: 'Sporlar', kelimeler: ['FUTBOL', 'TENİS', 'YÜZME', 'GÜREŞ'] },
  { baslik: 'Ağaçlar', kelimeler: ['ÇINAR', 'ÇAM', 'MEŞE', 'KAVAK'] },
  { baslik: 'Deniz canlıları', kelimeler: ['AHTAPOT', 'YENGEÇ', 'DENİZYILDIZI', 'MİDYE'] },
  { baslik: 'Sebzeler', kelimeler: ['HAVUÇ', 'PATATES', 'BİBER', 'LAHANA'] },
]

export function skorHesapla(hata: number): number {
  return Math.max(MIN_SKOR, TABAN_PUAN - hata * HATA_CEZASI)
}
