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
/** Nişan sınırları: yukarı bakış eksi. */
export const ACI_MIN = -78
export const ACI_MAX = 12
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

// --- Kale ---

export const KALE_CANI = 30

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
}

export const CANAVAR_TIPLERI: CanavarTipi[] = [
  {
    ad: 'Goblin',
    can: 2,
    hiz: 38,
    altin: 8,
    puan: 20,
    en: 26,
    boy: 36,
    renk: 0x84cc16,
    vurusHasari: 1,
    vurusAralikMs: 1600,
    ilkDalga: 1,
  },
  {
    ad: 'Ork',
    can: 5,
    hiz: 27,
    altin: 16,
    puan: 45,
    en: 32,
    boy: 46,
    renk: 0xa855f7,
    vurusHasari: 2,
    vurusAralikMs: 1900,
    ilkDalga: 2,
  },
  {
    ad: 'Trol',
    can: 11,
    hiz: 18,
    altin: 34,
    puan: 95,
    en: 42,
    boy: 58,
    renk: 0xf97316,
    vurusHasari: 3,
    vurusAralikMs: 2200,
    ilkDalga: 4,
  },
]

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
export const DALGA_HIZ_ARTISI = 0.035
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
export const OLUM_EFEKT_MS = 380
export const KALE_SARSINTI_MS = 180
export const KALE_SARSINTI_GUC = 0.006
export const HASAR_PARLAMA_MS = 120
export const OVERLAY_GECIKME_MS = 420
