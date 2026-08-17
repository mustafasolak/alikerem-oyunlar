/**
 * Kale Savunması sabitleri. Sihirli sayı yok: yerleşim, mızrak fiziği, canavar
 * tabloları ve dalga akışı hep buradan ayarlanır.
 *
 * Sahne yandan görünüş: solda kale duvarı, sağdan gelen canavarlar tek yolda
 * yürür. Yukarı yön eksi y'dir, açılar derece cinsindendir (0 = sağa yatay).
 */

export const GAME_WIDTH = 720
/** Bu genişlikten itibaren paneller açık başlar (tablet ve masaüstü). */
export const GENIS_EKRAN_ESIGI = 900
export const GAME_HEIGHT = 430

export const FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

// --- Yerleşim ---

/** Canavarların ayak bastığı hat — toprak yolun ortası. */
export const ZEMIN_Y = 384
export const KALE_GENISLIK = 112
/** Kale duvarının tepesi; mızrakçı burada durur. */
export const KALE_UST_Y = 150
/** Canavar duvarın bu kadar önünde durup vurmaya başlar. */
export const DURAK_X = KALE_GENISLIK + 22
/** Canavarlar ekranın bu kadar sağında doğar. */
export const DOGUS_X = GAME_WIDTH + 34
/** Mızrak bu kadar sağa geçince silinir. */
export const MIZRAK_TASMA = 60

/** Mızrağın çıktığı el. */
export const MIZRAK_CIKIS_X = 92
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

/**
 * Zorluk seviyeleri.
 *
 * Kolay yalnız canavarı zayıflatmıyor: kale daha canlı, altın daha bol, dalga
 * daha seyrek — yani çocuk nefes alabiliyor. Zor bunun tersi ve karşılığında
 * daha çok puan veriyor, skor tablosu adil kalsın.
 */
export interface Zorluk {
  id: string
  ad: string
  canCarpani: number
  hizCarpani: number
  kaleCarpani: number
  altinCarpani: number
  /** Dalga başına canavar sayısı çarpanı. */
  adetCarpani: number
  puanCarpani: number
}

export const ZORLUKLAR: Zorluk[] = [
  {
    id: 'kolay',
    ad: 'Kolay',
    canCarpani: 0.7,
    hizCarpani: 0.85,
    kaleCarpani: 1.5,
    altinCarpani: 1.6,
    adetCarpani: 0.75,
    puanCarpani: 0.7,
  },
  {
    id: 'orta',
    ad: 'Orta',
    canCarpani: 1,
    hizCarpani: 1,
    kaleCarpani: 1,
    altinCarpani: 1,
    adetCarpani: 1,
    puanCarpani: 1,
  },
  {
    id: 'zor',
    ad: 'Zor',
    canCarpani: 1.4,
    hizCarpani: 1.15,
    kaleCarpani: 0.8,
    altinCarpani: 0.8,
    adetCarpani: 1.3,
    puanCarpani: 1.5,
  },
]

/** Varsayılan zorluk: orta. */
export const VARSAYILAN_ZORLUK = 1

export function zorluk(sira: number): Zorluk {
  return ZORLUKLAR[Math.min(ZORLUKLAR.length - 1, Math.max(0, sira))]
}

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
export const DALGA_CAN_ARTISI = 0.24
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
  /** Dükkânda görünen kısa açıklama. */
  ozet: string
  /** Seviye başına fiyat: [0] satın alma, sonrası yükseltme. */
  fiyat: number[]
  /** Seviye başına atış hasarı. */
  hasar: number[]
  /** Seviye başına iki atış arası (ms). */
  aralikMs: number[]
  /** Seviye başına yatay menzil (piksel). */
  menzil: number[]
  renk: number
  /** Alan hasarı yarıçapı; 0 ise tek hedef vurur. */
  alan: number
  /** Zırhı yok sayar mı? (büyücü) */
  zirhDelici: boolean
  /** Vurduğunu yavaşlatır mı? (büyücü) */
  yavaslatir: boolean
  /** Atışın görünümü. */
  atisTuru: 'ok' | 'bomba' | 'buyu'
}

/** Oyuncu ilk kuleyi hemen kurabilsin: mekanik ilk saniyede görünür olsun. */
export const BASLANGIC_ALTIN = 45

export const KULE_TIPLERI: KuleTipi[] = [
  {
    ad: 'Okçu Kulesi',
    ozet: 'hızlı, tek hedef',
    fiyat: [45, 80, 130, 200, 300, 440, 640, 900, 1250, 1700, 2300, 3100],
    hasar: [1, 2, 3, 4, 6, 8, 11, 15, 20, 26, 34, 44],
    aralikMs: [1200, 950, 750, 600, 470, 400, 340, 290, 250, 220, 196, 176],
    menzil: [190, 225, 260, 295, 335, 370, 405, 440, 470, 495, 518, 540],
    renk: 0x0ea5e9,
    alan: 0,
    zirhDelici: false,
    yavaslatir: false,
    atisTuru: 'ok',
  },
  {
    // Bombacı: yavaş ama düştüğü yerin çevresindeki herkesi vurur.
    // Kalabalık dalgada okçudan çok daha verimli.
    ad: 'Bombacı Kulesi',
    ozet: 'yavaş, alan hasarı',
    fiyat: [110, 180, 280, 420, 620, 880, 1240, 1700, 2300, 3050, 4000, 5200],
    hasar: [3, 5, 7, 10, 14, 19, 25, 33, 43, 55, 70, 88],
    aralikMs: [2400, 2100, 1850, 1650, 1480, 1330, 1200, 1090, 990, 900, 820, 750],
    menzil: [170, 200, 230, 260, 290, 320, 350, 380, 405, 430, 452, 472],
    renk: 0xea580c,
    alan: 62,
    zirhDelici: false,
    yavaslatir: false,
    atisTuru: 'bomba',
  },
  {
    // Büyücü: zırhı yok sayar ve vurduğunu yavaşlatır.
    // Zırhlı ve golem karşısındaki kule cevabı.
    ad: 'Büyücü Kulesi',
    ozet: 'zırhı geçer, yavaşlatır',
    fiyat: [150, 240, 370, 550, 800, 1130, 1560, 2100, 2800, 3700, 4800, 6200],
    hasar: [2, 4, 6, 9, 12, 16, 21, 27, 35, 45, 57, 72],
    aralikMs: [1700, 1520, 1370, 1240, 1130, 1030, 950, 880, 820, 770, 725, 690],
    menzil: [200, 235, 270, 305, 340, 375, 410, 445, 478, 508, 535, 560],
    renk: 0x8b5cf6,
    alan: 0,
    zirhDelici: true,
    yavaslatir: true,
    atisTuru: 'buyu',
  },
]

export const KULE_MAX_SEVIYE = 12

/** Kule yuvalarının x konumları — kalenin sağında, yolun arkasındaki çimde. */
export const KULE_YUVALARI = [178, 292, 406, 520, 634]
/** Kulelerin oturduğu hat. */
export const KULE_TABAN_Y = 342
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
  { en: 43, boy: 88, mazgal: 7, cati: 25, bayrak: 19, takviye: true, susleme: true, isik: false, tonOran: 0.32 },
  { en: 47, boy: 99, mazgal: 8, cati: 28, bayrak: 21, takviye: true, susleme: true, isik: false, tonOran: 0.39 },
  { en: 51, boy: 110, mazgal: 9, cati: 31, bayrak: 23, takviye: true, susleme: true, isik: false, tonOran: 0.46 },
  { en: 55, boy: 121, mazgal: 10, cati: 34, bayrak: 25, takviye: true, susleme: true, isik: false, tonOran: 0.53 },
  { en: 58, boy: 128, mazgal: 11, cati: 35, bayrak: 25, takviye: true, susleme: true, isik: false, tonOran: 0.58 },
  { en: 61, boy: 134, mazgal: 12, cati: 36, bayrak: 26, takviye: true, susleme: true, isik: false, tonOran: 0.63 },
  { en: 63, boy: 139, mazgal: 13, cati: 36, bayrak: 26, takviye: true, susleme: true, isik: false, tonOran: 0.67 },
  { en: 65, boy: 143, mazgal: 14, cati: 37, bayrak: 27, takviye: true, susleme: true, isik: true, tonOran: 0.71 },
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
export const MENU_EN = 186
export const MENU_BASLIK_BOY = 22
export const MENU_SATIR_BOY = 34
/** Kutunun kule tepesinden yukarı payı. */
export const MENU_ALT_PAY = 12

// --- Mızrakçı yükseltmeleri (altının sonu gelmesin) ---

/**
 * Elementler: mızrak satın alınan elementle uçar.
 *
 * Alev vurduğunu yakar (zamana yayılı hasar), buz yavaşlatır, şimşek yakındaki
 * canavarlara atlar. Zırhlı canavarda tek tek az hasar geçtiği için alev ve
 * şimşek orada işe yarar; kalabalıkta buz zaman kazandırır.
 */
export type Element = 'normal' | 'alev' | 'buz' | 'simsek'

export const ELEMENT_SIMGE: Record<Element, string> = {
  normal: '🗡',
  alev: '🔥',
  buz: '❄️',
  simsek: '⚡',
}

export const ELEMENT_ADI: Record<Element, string> = {
  normal: 'Mızrak',
  alev: 'Alev',
  buz: 'Buz',
  simsek: 'Şimşek',
}

export const ELEMENT_RENGI: Record<Element, number> = {
  normal: 0xe5e7eb,
  alev: 0xf97316,
  buz: 0x67e8f9,
  simsek: 0xfacc15,
}

/** Alev: bu aralıkla bu kadar hasar, bu süre boyunca. Zırhı yok sayar. */
export const ALEV_ARALIK_MS = 500
export const ALEV_HASAR = 2
export const ALEV_SURE_MS = 3000

/** Buz: hızı bu oranla çarpar, bu süre boyunca. */
export const BUZ_ORAN = 0.45
export const BUZ_SURE_MS = 2200

/** Şimşek: bu menzildeki bu kadar komşuya atlar, bu hasarla. */
export const SIMSEK_MENZIL = 90
export const SIMSEK_HEDEF = 2
export const SIMSEK_HASAR = 3

/** Otomatik ateş elle atıştan yavaş olsun; elle oynamak yine daha iyi. */
export const OTOMATIK_BEKLEME_ORANI = 1.7
/** Otomatik nişan açı taramasının adımı (derece). Küçük olursa daha isabetli, daha pahalı. */
export const OTOMATIK_ACI_ADIMI = 3

export type YukseltmeTuru =
  | 'tamir'
  | 'hasar'
  | 'hiz'
  | 'kale'
  | 'kritiksans'
  | 'kritikhasar'
  | 'element'
  | 'otomatik'

export interface Yukseltme {
  id: string
  /** Düğme yazısı; DOM'a basılıyor, emoji burada sorun değil. */
  etiket: string
  ozet: string
  /** Kaç kez alınabilir. 0 = sınırsız (duvar tamiri). */
  maxSeviye: number
  fiyat: number
  /** Her alışta fiyat bu oranla artar. */
  fiyatArtisi: number
  tur: YukseltmeTuru
  element?: Element
}

/**
 * Kritik vuruş: mızrak bazen fazladan hasar verir.
 * Taban şans ve çarpan burada; yükseltmeler bunları büyütür.
 */
export const KRITIK_TABAN_SANS = 0.05
export const KRITIK_SANS_BONUSU = 0.04
export const KRITIK_TABAN_CARPAN = 2
export const KRITIK_CARPAN_BONUSU = 0.25
/** Kritik şansı bu oranı geçmesin; her vuruş kritik olmasın. */
export const KRITIK_MAX_SANS = 0.6

/** Duvar tamiri bir seferde ne kadar can verir. */
export const TAMIR_MIKTARI = 8
/** Hasar yükseltmesi her seviyede ne ekler. */
export const HASAR_BONUSU = 1
/** Hız yükseltmesi beklemeyi her seviyede hangi oranla çarpar. */
export const HIZ_ORANI = 0.88
/** Kale yükseltmesi azami canı her seviyede ne kadar arttırır. */
export const KALE_BONUSU = 8

export const YUKSELTMELER: Yukseltme[] = [
  {
    id: 'tamir',
    etiket: '🧱 Duvar tamiri',
    ozet: `+${TAMIR_MIKTARI} kale canı`,
    maxSeviye: 0,
    fiyat: 40,
    fiyatArtisi: 1,
    tur: 'tamir',
  },
  {
    id: 'hasar',
    etiket: '⚔️ Mızrak hasarı',
    ozet: `her seviyede +${HASAR_BONUSU} hasar`,
    maxSeviye: 20,
    fiyat: 70,
    fiyatArtisi: 1.55,
    tur: 'hasar',
  },
  {
    id: 'hiz',
    etiket: '⚡ Atış hızı',
    ozet: 'her seviyede bekleme %12 kısa',
    maxSeviye: 14,
    fiyat: 60,
    fiyatArtisi: 1.55,
    tur: 'hiz',
  },
  {
    id: 'kale',
    etiket: '🛡 Kale duvarı',
    ozet: `her seviyede +${KALE_BONUSU} azami can`,
    maxSeviye: 20,
    fiyat: 90,
    fiyatArtisi: 1.5,
    tur: 'kale',
  },
  {
    id: 'kritiksans',
    etiket: '🎯 Kritik şans',
    ozet: `her seviyede +%${Math.round(KRITIK_SANS_BONUSU * 100)} kritik şansı`,
    maxSeviye: 12,
    fiyat: 120,
    fiyatArtisi: 1.5,
    tur: 'kritiksans',
  },
  {
    id: 'kritikhasar',
    etiket: '💥 Kritik hasar',
    ozet: `her seviyede kritik çarpanı +${KRITIK_CARPAN_BONUSU}`,
    maxSeviye: 10,
    fiyat: 150,
    fiyatArtisi: 1.5,
    tur: 'kritikhasar',
  },
  {
    id: 'otomatik',
    etiket: '🤖 Otomatik ateş',
    ozet: 'mızrakçı kendi nişan alıp atar',
    maxSeviye: 1,
    fiyat: 220,
    fiyatArtisi: 1,
    tur: 'otomatik',
  },
  {
    id: 'alev',
    etiket: '🔥 Alev mızrağı',
    ozet: 'vurduğunu yakar, zırhı geçer',
    maxSeviye: 1,
    fiyat: 160,
    fiyatArtisi: 1,
    tur: 'element',
    element: 'alev',
  },
  {
    id: 'buz',
    etiket: '❄️ Buz mızrağı',
    ozet: 'vurduğunu yavaşlatır',
    maxSeviye: 1,
    fiyat: 190,
    fiyatArtisi: 1,
    tur: 'element',
    element: 'buz',
  },
  {
    id: 'simsek',
    etiket: '⚡ Şimşek mızrağı',
    ozet: 'yakındaki canavarlara atlar',
    maxSeviye: 1,
    fiyat: 260,
    fiyatArtisi: 1,
    tur: 'element',
    element: 'simsek',
  },
]

/** Bir sonraki seviyenin fiyatı (seviye 0 = hiç alınmamış). */
export function yukseltmeFiyati(y: Yukseltme, seviye: number): number {
  return Math.round(y.fiyat * Math.pow(y.fiyatArtisi, seviye))
}

// --- Ok (kule atışı) ---

export const OK_HIZI = 430
export const OK_BOY = 18
export const OK_KALINLIK = 2

// --- Dalgalar ---

export const DALGA_TABAN_ADET = 4
export const DALGA_ADET_ARTISI = 2
export const DALGA_MAX_ADET = 30
export const DOGUS_ARALIK_MS = 1500
export const DOGUS_ARALIK_AZALMA = 55
export const DOGUS_ARALIK_MIN = 420
/** Dalgalar arası hazırlık payı. */
export const DALGA_ARASI_MS = 3000
/** İlk dalga daha çabuk gelsin. */
export const ILK_ARA_MS = 1700
export const DALGA_HIZ_ARTISI = 0.05
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

/** Canavar başındaki küçük can barı — her zaman görünür. */
export const CANAVAR_BAR_BOY = 5
/** Hasar sayısının yükselip söndüğü süre. */
export const HASAR_YAZI_MS = 620
/** Kritik hasar yazısı bu kadar büyük çıkar. */
export const KRITIK_YAZI_OLCEK = 1.6

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
export const UFUK_Y = 262
/** Tepe tabanı. */
export const TEPE_Y = 328
/** Çim şeridinin üst kenarı; gökyüzü buraya kadar iner. */
export const CIM_UST_Y = 334
/** Toprak yolun üst kenarı — canavarlar bu bandın üzerinde yürür. */
export const YOL_UST_Y = 350

export const BULUT_ADET = 4
/** Bulut sürüklenme hızı (piksel/saniye). */
export const BULUT_HIZ = 7
export const YILDIZ_ADET = 44
export const AGAC_SALLANMA_ACI = 2.4
export const AGAC_SALLANMA_MS = 2600
export const MESALE_MS = 620

// --- Efektler ---

export const ISABET_EFEKT_MS = 220
/** Şimşek zinciri çizgisinin görünme süresi. */
export const ZINCIR_EFEKT_MS = 220
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
