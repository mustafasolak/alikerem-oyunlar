/**
 * Kale Savunması sabitleri. Sihirli sayı yok: yerleşim, mızrak fiziği, canavar
 * tabloları ve dalga akışı hep buradan ayarlanır.
 *
 * Sahne yandan görünüş: solda kale duvarı, sağdan gelen canavarlar tek yolda
 * yürür. Yukarı yön eksi y'dir, açılar derece cinsindendir (0 = sağa yatay).
 */

export const GAME_WIDTH = 540
export const GAME_HEIGHT = 400

export const FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

// --- Yerleşim ---

/** Canavarların ayak bastığı hat — toprak yolun ortası. */
export const ZEMIN_Y = 360
export const KALE_GENISLIK = 104
/** Kale duvarının tepesi; mızrakçı burada durur. */
export const KALE_UST_Y = 150
/** Canavar duvarın bu kadar önünde durup vurmaya başlar. */
export const DURAK_X = KALE_GENISLIK + 20
/** Canavarlar ekranın bu kadar sağında doğar. */
export const DOGUS_X = GAME_WIDTH + 34
/** Mızrak bu kadar sağa geçince silinir. */
export const MIZRAK_TASMA = 60

/** Mızrağın çıktığı el. */
export const MIZRAK_CIKIS_X = 84
export const MIZRAK_CIKIS_Y = KALE_UST_Y - 26

// --- Mızrak ---

export const YERCEKIMI = 780
export const MIZRAK_HIZI = 470
/**
 * Nişan sınırları: yukarı bakış eksi.
 *
 * ACI_MAX dik olmalı — yoksa mızrak en aşağı açıda bile uzağa düşer ve
 * duvarın dibine gelmiş canavar hiç vurulamaz. 80° ile yolun tamamı,
 * duvarın hemen önü dahil, nişan alınabiliyor.
 */
export const ACI_MIN = -78
export const ACI_MAX = 80
export const ACI_BASLANGIC = -42
/** Klavyeyle bir basışta değişen açı. */
export const ACI_ADIM = 4
export const ATIS_BEKLEME_MS = 400
export const MIZRAK_HASARI = 2
/** Çarpışma toleransı: mızrak ucu bu kadar yakınsa isabet sayılır. */
export const MIZRAK_TEMAS = 5

export const MIZRAK_BOY = 30
export const MIZRAK_KALINLIK = 3
/** Yere saplanan mızrak bu kadar sonra silinir. */
export const SAPLANAN_OMUR_MS = 2600

/** Nişan yayı önizlemesi. */
export const NISAN_ADIM_MS = 24
export const NISAN_MAX_ADIM = 140
export const NISAN_NOKTA_ARALIK = 12

// --- Simülasyon ---

/** Sabit adım: çarpışma kaçırmayalım, sekme arka planda kalınca fırlamayalım. */
export const SIM_ADIM_MS = 16
export const MAX_BIRIKIM_MS = 96
/** Bacakların bir tam yürüme çevrimi kaç pikselde tamamlanır. */
export const ADIM_UZUNLUK = 17

// --- Canavarlar ---

export interface CanavarTipi {
  ad: string
  can: number
  /** Yürüme hızı (piksel/saniye). */
  hiz: number
  /** Öldürülünce verdiği oyun parası. */
  altin: number
  puan: number
  /** Gövde ölçüleri (piksel). */
  en: number
  boy: number
  renk: number
  /** Duvara her vuruşta götürdüğü kale canı. */
  vurusHasari: number
  vurusAralikMs: number
  /** Kaçıncı dalgadan itibaren çıkar. */
  ilkDalga: number
  /**
   * Her isabetten düşülen hasar; en az 1 hasar yine geçer.
   * Zırh kule okuna (tek tek az hasar) mızraktan çok daha etkili.
   */
  zirh: number
  /** Uçuyor mu? Uçana mızrak değmez, yalnız kule oku vurur. */
  ucar: boolean
  /** Uçanların yerden yüksekliği (piksel). */
  yukseklik: number
  /** Dalga sonunda tek başına gelen şef mi? Rastgele seçime girmez. */
  patron: boolean
}

export const CANAVAR_TIPLERI: CanavarTipi[] = [
  {
    ad: 'Goblin',
    can: 3,
    hiz: 42,
    altin: 8,
    puan: 20,
    en: 26,
    boy: 36,
    renk: 0x84cc16,
    vurusHasari: 1,
    vurusAralikMs: 1500,
    ilkDalga: 1,
    zirh: 0,
    ucar: false,
    yukseklik: 0,
    patron: false,
  },
  {
    ad: 'Ork',
    can: 7,
    hiz: 30,
    altin: 16,
    puan: 45,
    en: 32,
    boy: 46,
    renk: 0xa855f7,
    vurusHasari: 3,
    vurusAralikMs: 1800,
    ilkDalga: 2,
    zirh: 0,
    ucar: false,
    yukseklik: 0,
    patron: false,
  },
  {
    ad: 'Trol',
    can: 14,
    hiz: 20,
    altin: 34,
    puan: 95,
    en: 42,
    boy: 58,
    renk: 0xf97316,
    vurusHasari: 4,
    vurusAralikMs: 2100,
    ilkDalga: 4,
    zirh: 0,
    ucar: false,
    yukseklik: 0,
    patron: false,
  },
  {
    // Zırhlı: yavaş ama her isabetten 2 hasar yutar. Kulenin tek tek az
    // hasar veren okuna dayanıklı; güçlü mızrak ve yüksek seviye kule gerek.
    ad: 'Zırhlı',
    can: 12,
    hiz: 22,
    altin: 26,
    puan: 70,
    en: 34,
    boy: 48,
    renk: 0x64748b,
    vurusHasari: 3,
    vurusAralikMs: 2000,
    ilkDalga: 5,
    zirh: 2,
    ucar: false,
    yukseklik: 0,
    patron: false,
  },
  {
    // Yarasa: hızlı ve alçaktan uçar. Mızrak değmez, yalnız kule vurabilir —
    // oyuncuyu kule kurmaya zorlayan tip.
    ad: 'Yarasa',
    can: 6,
    hiz: 48,
    altin: 20,
    puan: 55,
    en: 30,
    boy: 24,
    renk: 0x7c3aed,
    vurusHasari: 2,
    vurusAralikMs: 1400,
    ilkDalga: 6,
    zirh: 0,
    ucar: true,
    yukseklik: 92,
    patron: false,
  },
  {
    // Şef: dalga sonunda tek başına gelen dev. Rastgele doğmaz.
    ad: 'Şef',
    can: 60,
    hiz: 14,
    altin: 120,
    puan: 400,
    en: 56,
    boy: 76,
    renk: 0xb91c1c,
    vurusHasari: 6,
    vurusAralikMs: 2400,
    ilkDalga: 5,
    zirh: 3,
    ucar: false,
    yukseklik: 0,
    patron: true,
  },
]

/**
 * İkinci dünyanın canavarları: bambaşka tipler, birinci dünyanın iki katına
 * yakın güçte. Buz goblini hızlı, taş golem ağır zırhlı, hayalet uçuyor,
 * alev trolü kaleyi hızlı yıkıyor, kara şef ise dalga sonunda geliyor.
 */
export const CANAVAR_TIPLERI_2: CanavarTipi[] = [
  {
    ad: 'Buz Goblini',
    can: 8,
    hiz: 52,
    altin: 18,
    puan: 45,
    en: 27,
    boy: 38,
    renk: 0x38bdf8,
    vurusHasari: 2,
    vurusAralikMs: 1300,
    ilkDalga: 1,
    zirh: 0,
    ucar: false,
    yukseklik: 0,
    patron: false,
  },
  {
    ad: 'Kurt',
    can: 14,
    hiz: 60,
    altin: 26,
    puan: 70,
    en: 34,
    boy: 34,
    renk: 0x475569,
    vurusHasari: 3,
    vurusAralikMs: 1100,
    ilkDalga: 2,
    zirh: 0,
    ucar: false,
    yukseklik: 0,
    patron: false,
  },
  {
    ad: 'Alev Trolü',
    can: 30,
    hiz: 24,
    altin: 55,
    puan: 150,
    en: 44,
    boy: 62,
    renk: 0xdc2626,
    vurusHasari: 7,
    vurusAralikMs: 1900,
    ilkDalga: 3,
    zirh: 1,
    ucar: false,
    yukseklik: 0,
    patron: false,
  },
  {
    ad: 'Taş Golem',
    can: 34,
    hiz: 18,
    altin: 70,
    puan: 190,
    en: 40,
    boy: 56,
    renk: 0x78716c,
    vurusHasari: 6,
    vurusAralikMs: 2000,
    ilkDalga: 4,
    zirh: 4,
    ucar: false,
    yukseklik: 0,
    patron: false,
  },
  {
    ad: 'Hayalet',
    can: 18,
    hiz: 58,
    altin: 46,
    puan: 120,
    en: 32,
    boy: 30,
    renk: 0xa78bfa,
    vurusHasari: 4,
    vurusAralikMs: 1200,
    ilkDalga: 5,
    zirh: 1,
    ucar: true,
    yukseklik: 96,
    patron: false,
  },
  {
    ad: 'Kara Şef',
    can: 160,
    hiz: 13,
    altin: 300,
    puan: 900,
    en: 62,
    boy: 84,
    renk: 0x1e1b4b,
    vurusHasari: 10,
    vurusAralikMs: 2300,
    ilkDalga: 5,
    zirh: 5,
    ucar: false,
    yukseklik: 0,
    patron: true,
  },
]

/** Şef kaç dalgada bir gelir. */
export const PATRON_DALGA_ARALIK = 5

export interface Dunya {
  ad: string
  /** Araç çubuğu düğmesinde görünen kısa ad. */
  kisaAd: string
  canavarlar: CanavarTipi[]
  kaleCani: number
  /** Ödül çarpanı: ileri dünya daha çok altın ve puan verir. */
  odulCarpani: number
  /** Arka plan bu vakitten başlar (2. dünya akşamda açılır). */
  vakitBaslangic: number
}

export const DUNYALAR: Dunya[] = [
  {
    ad: 'Yeşil Ovalar',
    kisaAd: 'Dünya 1',
    canavarlar: CANAVAR_TIPLERI,
    kaleCani: 30,
    odulCarpani: 1,
    vakitBaslangic: 0,
  },
  {
    ad: 'Karanlık Diyar',
    kisaAd: 'Dünya 2',
    canavarlar: CANAVAR_TIPLERI_2,
    kaleCani: 40,
    odulCarpani: 1.6,
    vakitBaslangic: 1,
  },
]

/** İkinci dünyayı açmak için toplam kaç canavar öldürmek gerekir. */
export const DUNYA_ESIGI = 1000

export function dunya(sira: number): Dunya {
  return DUNYALAR[Math.min(DUNYALAR.length - 1, Math.max(0, sira))]
}

export function patronDalgasiMi(dalga: number): boolean {
  return dalga > 0 && dalga % PATRON_DALGA_ARALIK === 0
}

/** Canavarın ayak (uçanlarda alt) hattı. */
export function canavarAyakY(tip: CanavarTipi): number {
  return ZEMIN_Y - tip.yukseklik
}

/**
 * Dalga başına can çarpanı.
 *
 * Bu olmadan 10. dalgada da 1. dalganın canavarı geliyordu: kuleler 5 seviyeye
 * çıkarken canavarlar aynı kalıyor, oyun bir yerden sonra kendiliğinden
 * bitiyordu. Artık her dalgada canlar da büyüyor.
 */
export const DALGA_CAN_ARTISI = 0.18
/** Güçlenen canavar daha çok altın ve puan verir; ekonomi geride kalmasın. */
export const DALGA_ODUL_ARTISI = 0.1
/**
 * Güçlü tiplerin sıklaşma hızı: bu dalgaya gelindiğinde ağırlık tamamen
 * tersine döner, yani trol goblinden sık çıkar.
 */
export const TIP_KAYMA_DALGA = 10

export function dalgaCanCarpani(dalga: number): number {
  return 1 + Math.max(0, dalga - 1) * DALGA_CAN_ARTISI
}

export function dalgaOdulCarpani(dalga: number): number {
  return 1 + Math.max(0, dalga - 1) * DALGA_ODUL_ARTISI
}

// --- Kuleler ---

export interface KuleTipi {
  ad: string
  /** Seviye başına fiyat: [0] satın alma, sonrası yükseltme. */
  fiyat: number[]
  /** Seviye başına atış hasarı. */
  hasar: number[]
  /** Seviye başına iki atış arası (ms). */
  aralikMs: number[]
  /** Seviye başına yatay menzil (piksel). */
  menzil: number[]
  renk: number
}

/** Oyuncu ilk kuleyi hemen kurabilsin: mekanik ilk saniyede görünür olsun. */
export const BASLANGIC_ALTIN = 45

export const KULE_TIPLERI: KuleTipi[] = [
  {
    ad: 'Okçu Kulesi',
    fiyat: [45, 80, 130, 200, 300],
    hasar: [1, 2, 3, 4, 6],
    aralikMs: [1200, 950, 750, 600, 470],
    menzil: [190, 225, 260, 295, 335],
    renk: 0x0ea5e9,
  },
]

export const KULE_MAX_SEVIYE = 5

/** Kule yuvalarının x konumları — kalenin sağında, yolun arkasındaki çimde. */
export const KULE_YUVALARI = [176, 300, 424]
/** Kulelerin oturduğu hat. */
export const KULE_TABAN_Y = 320
/** Yuva tabanındaki taş platform. */
export const YUVA_EN = 38
export const YUVA_BOY = 9

/**
 * Seviyeye göre kule görünümü.
 *
 * Yükseltme yalnız sayı değiştirmesin: kule büyüyor, mazgalı çoğalıyor,
 * çatı çıkıyor, bayrak ve altın süsleme geliyor, en üstte tepe ışığı yanıyor.
 * Oyuncu tahtaya bakınca hangi kulenin güçlü olduğunu okuyabilsin.
 */
export interface KuleSeviyeGorunum {
  en: number
  /** Mazgal hattına kadar gövde yüksekliği. */
  boy: number
  mazgal: number
  /** Çatı yüksekliği; 0 = çatı yok. */
  cati: number
  /** Bayrak direği yüksekliği; 0 = bayrak yok. */
  bayrak: number
  /** Taban köşelerinde taş takviye. */
  takviye: boolean
  /** Gövdeyi saran altın şerit. */
  susleme: boolean
  /** Tepede yanıp sönen ışık (en üst seviye). */
  isik: boolean
  /** Gövde renginin açılma oranı: üst seviye daha parlak. */
  tonOran: number
}

export const KULE_SEVIYE_GORUNUM: KuleSeviyeGorunum[] = [
  { en: 26, boy: 42, mazgal: 3, cati: 0, bayrak: 0, takviye: false, susleme: false, isik: false, tonOran: 0 },
  { en: 30, boy: 54, mazgal: 4, cati: 14, bayrak: 0, takviye: false, susleme: false, isik: false, tonOran: 0.1 },
  { en: 34, boy: 66, mazgal: 5, cati: 18, bayrak: 15, takviye: true, susleme: false, isik: false, tonOran: 0.17 },
  { en: 38, boy: 77, mazgal: 6, cati: 22, bayrak: 17, takviye: true, susleme: true, isik: false, tonOran: 0.24 },
  { en: 43, boy: 88, mazgal: 7, cati: 25, bayrak: 19, takviye: true, susleme: true, isik: true, tonOran: 0.32 },
]

export function kuleGorunum(seviye: number): KuleSeviyeGorunum {
  const sira = Math.min(KULE_SEVIYE_GORUNUM.length, Math.max(1, seviye)) - 1
  return KULE_SEVIYE_GORUNUM[sira]
}

/** Okun çıktığı yükseklik: mazgal hattı. */
export function kuleAtisY(seviye: number): number {
  return KULE_TABAN_Y - kuleGorunum(seviye).boy
}

/** Kulenin bayrak ucuna kadar en tepesi — dükkân kutusu buranın üstüne oturur. */
export function kuleTepeY(seviye: number): number {
  const g = kuleGorunum(seviye)
  return KULE_TABAN_Y - g.boy - g.cati - g.bayrak
}

/** Dükkân kutusu ölçüleri. */
export const MENU_EN = 138
export const MENU_BASLIK_BOY = 22
export const MENU_SATIR_BOY = 34
/** Kutunun kule tepesinden yukarı payı. */
export const MENU_ALT_PAY = 12

// --- Malzemeler (altınla alınan destekler) ---

export interface Malzeme {
  id: string
  /** Düğme yazısı; sayfada DOM'a basılıyor, emoji burada sorun değil. */
  etiket: string
  ozet: string
  fiyat: number
  /** Bir kez alınıp kalıcı mı? (tamir her seferinde alınabilir) */
  tekSeferlik: boolean
}

/** Duvar tamiri bir seferde ne kadar can verir. */
export const TAMIR_MIKTARI = 8
/** Keskin mızrak hasara ne ekler. */
export const KESKIN_BONUS = 1
/** Hızlı atış beklemeyi hangi oranla çarpar. */
export const HIZLI_ORAN = 0.7

export const MALZEMELER: Malzeme[] = [
  {
    id: 'tamir',
    etiket: '🧱 Duvar tamiri',
    ozet: `+${TAMIR_MIKTARI} kale canı`,
    fiyat: 40,
    tekSeferlik: false,
  },
  {
    id: 'keskin',
    etiket: '⚔️ Keskin mızrak',
    ozet: `mızrak hasarı +${KESKIN_BONUS}`,
    fiyat: 70,
    tekSeferlik: true,
  },
  {
    id: 'hizli',
    etiket: '⚡ Hızlı atış',
    ozet: `bekleme %${Math.round((1 - HIZLI_ORAN) * 100)} kısa`,
    fiyat: 60,
    tekSeferlik: true,
  },
]

// --- Ok (kule atışı) ---

export const OK_HIZI = 430
export const OK_BOY = 18
export const OK_KALINLIK = 2

// --- Dalgalar ---

export const DALGA_TABAN_ADET = 4
export const DALGA_ADET_ARTISI = 2
export const DALGA_MAX_ADET = 22
export const DOGUS_ARALIK_MS = 1500
export const DOGUS_ARALIK_AZALMA = 55
export const DOGUS_ARALIK_MIN = 520
/** Dalgalar arası hazırlık payı. */
export const DALGA_ARASI_MS = 3000
/** İlk dalga daha çabuk gelsin. */
export const ILK_ARA_MS = 1700
export const DALGA_HIZ_ARTISI = 0.045
export const DALGA_BONUSU = 120
export const DALGA_ALTIN_BONUSU = 25

/** Dalgada kaç canavar çıkar. */
export function dalgaCanavarSayisi(dalga: number): number {
  return Math.min(DALGA_MAX_ADET, DALGA_TABAN_ADET + (dalga - 1) * DALGA_ADET_ARTISI)
}

// --- Renkler ---

/** İki rengi oranla karıştırır (0 = ilk renk, 1 = ikinci). */
export function renkKaristir(from: number, to: number, ratio: number): number {
  const t = Math.min(1, Math.max(0, ratio))
  const mix = (shift: number): number => {
    const a = (from >> shift) & 0xff
    const b = (to >> shift) & 0xff
    return Math.round(a + (b - a) * t)
  }
  return (mix(16) << 16) | (mix(8) << 8) | mix(0)
}

export const COLORS = {
  KALE_TAS: 0x6b7280,
  KALE_TAS_KOYU: 0x4b5563,
  KALE_TAS_ACIK: 0x9ca3af,
  KALE_KAPI: 0x422006,
  BAYRAK: 0xdc2626,
  BAYRAK_DIREK: 0x78716c,
  MESALE: 0xfbbf24,
  MIZRAKCI: 0x1d4ed8,
  MIZRAKCI_TEN: 0xf5d0a9,
  MIZRAK_SAP: 0xa16207,
  MIZRAK_UC: 0xe5e7eb,
  OK_SAP: 0x57534e,
  OK_UC: 0xf1f5f9,
  YUVA_TAS: 0x6b7280,
  YUVA_BOS: 0xfef08a,
  KULE_CATI: 0x1e3a8a,
  MENU_ARKA: 0x0f172a,
  MENU_KENAR: 0x94a3b8,
  MENU_PARA_YOK: 0x64748b,
  MENZIL: 0x38bdf8,
  YUKSELT: 0x16a34a,
  ALTIN: 0xfbbf24,
  ALTIN_KENAR: 0x92400e,
  NISAN: 0xfef08a,
  CAN_BAR_ARKA: 0x111827,
  CAN_BAR_DOLU: 0x22c55e,
  CAN_BAR_AZ: 0xef4444,
  KAN: 0xdc2626,
  YAZI: '#f8fafc',
} as const

/** Kale can barı. */
export const CAN_BAR_EN = 88
export const CAN_BAR_BOY = 9
/** Bu oranın altında bar kırmızıya döner. */
export const CAN_BAR_AZ_ORAN = 0.35

/** Canavar başındaki küçük can barı. */
export const CANAVAR_BAR_BOY = 4

// --- Arka plan ---

export interface VakitPaleti {
  ad: string
  gokUst: number
  gokAlt: number
  /** Güneş ya da ay. */
  isik: number
  dag: number
  dagOn: number
  tepe: number
  agacArka: number
  agacOn: number
  cim: number
  yol: number
  yolCizgi: number
  tas: number
  yildizli: boolean
}

export const VAKITLER: VakitPaleti[] = [
  {
    ad: 'gündüz',
    gokUst: 0x38bdf8,
    gokAlt: 0xdbf1fb,
    isik: 0xfde047,
    dag: 0x6b8ca8,
    dagOn: 0x8aa8be,
    tepe: 0x4d7c0f,
    agacArka: 0x166534,
    agacOn: 0x15803d,
    cim: 0x65a30d,
    yol: 0x9a7b4f,
    yolCizgi: 0x7c6039,
    tas: 0x94a3b8,
    yildizli: false,
  },
  {
    ad: 'akşam',
    gokUst: 0x3b2467,
    gokAlt: 0xf98c4b,
    isik: 0xffd08a,
    dag: 0x53406e,
    dagOn: 0x6b5185,
    tepe: 0x3f5d16,
    agacArka: 0x14432b,
    agacOn: 0x1c5b32,
    cim: 0x4d7c0f,
    yol: 0x7d6340,
    yolCizgi: 0x5f4b30,
    tas: 0x7c8697,
    yildizli: false,
  },
  {
    ad: 'gece',
    gokUst: 0x070d20,
    gokAlt: 0x1e293b,
    isik: 0xe2e8f0,
    dag: 0x1c2740,
    dagOn: 0x27334f,
    tepe: 0x1a2e12,
    agacArka: 0x0b2418,
    agacOn: 0x11351f,
    cim: 0x27430b,
    yol: 0x4b3c26,
    yolCizgi: 0x392d1c,
    tas: 0x475569,
    yildizli: true,
  },
]

/** Kaç dalgada bir vakit ilerler: 1-3 gündüz, 4-6 akşam, 7+ gece. */
export const VAKIT_DALGA_ARALIK = 3

export function vakitIndeksi(dalga: number): number {
  const kat = Math.floor(Math.max(0, dalga - 1) / VAKIT_DALGA_ARALIK)
  return Math.min(VAKITLER.length - 1, kat)
}

/** Gökyüzü geçişi kaç banda bölünsün — az olursa bantlar çizgi çizgi görünür. */
export const GOK_BANT = 28
/** Dağ tabanı (ufuk). */
export const UFUK_Y = 250
/** Tepe tabanı. */
export const TEPE_Y = 306
/** Çim şeridinin üst kenarı; gökyüzü buraya kadar iner. */
export const CIM_UST_Y = 312
/** Toprak yolun üst kenarı — canavarlar bu bandın üzerinde yürür. */
export const YOL_UST_Y = 328

export const BULUT_ADET = 4
/** Bulut sürüklenme hızı (piksel/saniye). */
export const BULUT_HIZ = 7
export const YILDIZ_ADET = 44
export const AGAC_SALLANMA_ACI = 2.4
export const AGAC_SALLANMA_MS = 2600
export const MESALE_MS = 620

// --- Efektler ---

export const ISABET_EFEKT_MS = 220
/** Kule yükselince yeni görünümün zıplama süresi. */
export const KULE_POP_MS = 320
/** En üst seviye kulenin tepe ışığı yanıp sönme süresi. */
export const KULE_ISIK_MS = 780
export const OLUM_EFEKT_MS = 380
export const KALE_SARSINTI_MS = 180
export const KALE_SARSINTI_GUC = 0.006
export const HASAR_PARLAMA_MS = 120
/** Uçan canavarın kanat çırpma açısı (derece). */
export const KANAT_ACI = 34
/** Uçan canavarın havada salınma genliği (piksel). */
export const UCUS_SALINIM = 5
export const OVERLAY_GECIKME_MS = 420
