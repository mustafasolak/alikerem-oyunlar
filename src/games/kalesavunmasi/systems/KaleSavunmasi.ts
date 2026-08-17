/**
 * Kale Savunması mantığı — Phaser'dan bağımsız, Node'da tek başına test edilir.
 *
 * Sahne yalnızca burada tutulan durumu çizer: canavarların yeri, uçan mızraklar,
 * kale canı ve dalga akışı hep bu sınıfta ilerler. Simülasyon sabit adımla
 * (SIM_ADIM_MS) koşar; böylece hızlı mızrak canavarın içinden geçip gitmez ve
 * sekme arka planda kalınca oyun birden fırlamaz.
 */

import { type Uretec } from '../../../shared/rastgele.ts'
import type { CanavarTipi, Element } from '../config/constants.ts'
import {
  ACI_BASLANGIC,
  ACI_MAX,
  ALEV_ARALIK_MS,
  ALEV_HASAR,
  ALEV_SURE_MS,
  BUZ_ORAN,
  BUZ_SURE_MS,
  HASAR_BONUSU,
  HIZ_ORANI,
  KALE_BONUSU,
  OTOMATIK_ACI_ADIMI,
  OTOMATIK_BEKLEME_ORANI,
  SIMSEK_HASAR,
  SIMSEK_HEDEF,
  SIMSEK_MENZIL,
  TAMIR_MIKTARI,
  YUKSELTMELER,
  yukseltmeFiyati,
  ACI_MIN,
  ADIM_UZUNLUK,
  ATIS_BEKLEME_MS,
  BASLANGIC_ALTIN,
  DALGA_ALTIN_BONUSU,
  DALGA_ARASI_MS,
  DALGA_BONUSU,
  DALGA_HIZ_ARTISI,
  DOGUS_ARALIK_AZALMA,
  DOGUS_ARALIK_MIN,
  DOGUS_ARALIK_MS,
  DOGUS_X,
  DUNYALAR,
  DURAK_X,
  GAME_WIDTH,
  ILK_ARA_MS,
  KULE_MAX_SEVIYE,
  KULE_TIPLERI,
  KULE_YUVALARI,
  MAX_BIRIKIM_MS,
  MIZRAK_CIKIS_X,
  MIZRAK_CIKIS_Y,
  MIZRAK_HASARI,
  MIZRAK_HIZI,
  MIZRAK_TASMA,
  MIZRAK_TEMAS,
  NISAN_ADIM_MS,
  NISAN_MAX_ADIM,
  OK_HIZI,
  SIM_ADIM_MS,
  TIP_KAYMA_DALGA,
  YERCEKIMI,
  ZEMIN_Y,
  canavarAyakY,
  dalgaCanCarpani,
  dalgaCanavarSayisi,
  dalgaOdulCarpani,
  dunya,
  kuleAtisY,
  patronDalgasiMi,
} from '../config/constants.ts'

export type CanavarDurum = 'yuruyor' | 'vuruyor'

export interface Canavar {
  id: number
  /** CANAVAR_TIPLERI dizisindeki sıra. */
  tip: number
  x: number
  can: number
  maxCan: number
  /** Doğduğu dalgaya göre hesaplanmış ödül; sonra dalga ilerlese de değişmez. */
  altin: number
  puan: number
  durum: CanavarDurum
  /** Yürüme/vuruş animasyon fazı (0..1) — sahne bacakları buna göre çizer. */
  faz: number
  vurusBirikim: number
  /** Alev: kalan yanma süresi (ms) ve tik birikimi. */
  yanmaKalan: number
  yanmaTik: number
  /** Buz: kalan yavaşlama süresi (ms). */
  yavaslikKalan: number
}

/** Havadaki cisim: oyuncunun mızrağı ya da kulenin oku. */
export interface Atis {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  hasar: number
  /** Yerçekimine tabi mi? Mızrak yay çizer, ok düz gider. */
  agir: boolean
  /** Sahne buna göre çizer. */
  tur: 'mizrak' | 'ok'
  /** Mızrağın elementi; ok her zaman 'normal'. */
  element: Element
}

/** Yuvaya kurulmuş kule. */
export interface Kule {
  /** KULE_YUVALARI dizisindeki sıra. */
  yuva: number
  /** KULE_TIPLERI dizisindeki sıra. */
  tip: number
  seviye: number
  atisBirikim: number
}

export interface Isabet {
  canavarId: number
  x: number
  y: number
  tip: number
  /** Bu isabetle öldü mü? */
  oldu: boolean
  /** Ölümden kazanılan puan (öldürmediyse 0). */
  puan: number
}

/** Bir karede olan biten: sahne bunları görsele çevirir. */
export interface AdimSonucu {
  isabetler: Isabet[]
  /** Yere saplanan mızraklar. */
  saplananlar: { x: number; aci: number }[]
  kaleVuruldu: boolean
  /** Bu adımda kule ok attı mı? */
  kuleAtti: boolean
  /** Şimşeğin atladığı yollar; sahne çizgi çizer. */
  zincirler: { x1: number; y1: number; x2: number; y2: number }[]
  /** Bu adımda başlayan dalganın numarası (yoksa null). */
  yeniDalga: number | null
  /** Bu adımda tamamlanan dalganın numarası (yoksa null). */
  bitenDalga: number | null
  oyunBitti: boolean
}

/** 'hazir': oyuncu Başlat'a basmadı, hiçbir şey ilerlemiyor. */
export type Asama = 'hazir' | 'ara' | 'dalga' | 'bitti'

function bosSonuc(): AdimSonucu {
  return {
    isabetler: [],
    saplananlar: [],
    kaleVuruldu: false,
    kuleAtti: false,
    zincirler: [],
    yeniDalga: null,
    bitenDalga: null,
    oyunBitti: false,
  }
}

export class KaleSavunmasi {
  /** Kaçıncı dünya (0 tabanlı). Canavar tablosu ve kale canı buradan gelir. */
  dunyaSira: number
  dalga = 0
  kaleCani: number
  skor = 0
  /** Oyun parası — kuleler bununla alınır. */
  altin = BASLANGIC_ALTIN
  oldurulen = 0
  asama: Asama = 'hazir'
  duraklatildi = false
  /** Nişan açısı (derece; 0 = sağa yatay, eksi = yukarı). */
  aci = ACI_BASLANGIC

  /** Yükseltme kimliği → alınan seviye. */
  readonly yukseltmeler = new Map<string, number>()
  /** Etkin element; satın alınmayan seçilemez. */
  element: Element = 'normal'
  /** Otomatik ateş açık mı? (yükseltme alınmadan açılamaz) */
  otomatik = false

  readonly canavarlar: Canavar[] = []
  readonly atislar: Atis[] = []
  /** Yuva başına kule; boş yuva null. */
  readonly kuleler: (Kule | null)[] = KULE_YUVALARI.map(() => null)

  /** Testlerde kestirilebilir olsun diye üreteç dışarıdan verilebilir. */
  private readonly random: Uretec
  private sonrakiId = 1
  private kalanDogus = 0
  private dogusBirikim = 0
  private araBirikim = 0
  private beklemeBirikim = ATIS_BEKLEME_MS
  private simBirikim = 0

  constructor(random: Uretec = Math.random, dunyaSira = 0) {
    this.random = random
    this.dunyaSira = dunyaSira
    this.kaleCani = dunya(dunyaSira).kaleCani
    this.reset()
  }

  /** Bu dünyanın canavar tablosu. */
  get tipler(): CanavarTipi[] {
    return dunya(this.dunyaSira).canavarlar
  }

  /** Bu dünyanın kale canı + alınan duvar yükseltmeleri. */
  get maxKaleCani(): number {
    return dunya(this.dunyaSira).kaleCani + this.yukseltmeSeviyesi('kale') * KALE_BONUSU
  }

  /** Mızrak hasarı: taban + hasar yükseltmeleri. */
  get mizrakHasari(): number {
    return MIZRAK_HASARI + this.yukseltmeSeviyesi('hasar') * HASAR_BONUSU
  }

  /** Atış beklemesi (ms): her hız seviyesi kısaltır. */
  get atisBeklemesi(): number {
    const temel = ATIS_BEKLEME_MS * Math.pow(HIZ_ORANI, this.yukseltmeSeviyesi('hiz'))
    // Otomatik ateş elle atıştan yavaş olsun.
    return Math.round(temel * (this.otomatik ? OTOMATIK_BEKLEME_ORANI : 1))
  }

  /** Satın alınmış elementler; normal her zaman var. */
  get acikElementler(): Element[] {
    const liste: Element[] = ['normal']
    for (const y of YUKSELTMELER) {
      if (y.tur === 'element' && y.element && this.yukseltmeSeviyesi(y.id) > 0) liste.push(y.element)
    }
    return liste
  }

  /** Dünyayı değiştirir ve turu sıfırlar. */
  dunyaSec(sira: number): void {
    this.dunyaSira = Math.max(0, Math.min(DUNYALAR.length - 1, sira))
    this.reset()
  }

  reset(): void {
    this.dalga = 0
    this.kaleCani = this.maxKaleCani
    this.skor = 0
    this.altin = BASLANGIC_ALTIN
    this.oldurulen = 0
    this.asama = 'hazir'
    this.duraklatildi = false
    this.aci = ACI_BASLANGIC
    this.yukseltmeler.clear()
    this.element = 'normal'
    this.otomatik = false
    this.canavarlar.length = 0
    this.atislar.length = 0
    this.kuleler.fill(null)
    this.sonrakiId = 1
    this.kalanDogus = 0
    this.dogusBirikim = 0
    // Başlat'a basılınca ilk dalga tam 3 saniye beklemesin.
    this.araBirikim = DALGA_ARASI_MS - ILK_ARA_MS
    this.beklemeBirikim = ATIS_BEKLEME_MS
    this.simBirikim = 0
  }

  get bitti(): boolean {
    return this.asama === 'bitti'
  }

  /** Simülasyon ilerliyor mu? */
  get calisiyor(): boolean {
    return (this.asama === 'ara' || this.asama === 'dalga') && !this.duraklatildi
  }

  /** Atış hazır mı? */
  get atisHazir(): boolean {
    return this.beklemeBirikim >= this.atisBeklemesi
  }

  /** Bekleme çubuğu için 0..1. */
  get atisDolulugu(): number {
    return Math.min(1, this.beklemeBirikim / this.atisBeklemesi)
  }

  // --- Akış denetimi ---

  /** Başlat: ilk dalganın hazırlık payını çalıştırır. */
  basla(): boolean {
    if (this.asama !== 'hazir') return false
    this.asama = 'ara'
    this.duraklatildi = false
    return true
  }

  /** Duraklat / devam et. Döndürdüğü değer yeni duraklama durumu. */
  duraklatDegistir(): boolean {
    if (this.asama === 'hazir' || this.asama === 'bitti') return this.duraklatildi
    this.duraklatildi = !this.duraklatildi
    // Duraklarken biriken süre atılsın: devam edince oyun fırlamasın.
    this.simBirikim = 0
    return this.duraklatildi
  }

  devam(): void {
    if (this.duraklatildi) this.duraklatDegistir()
  }

  /** Sonraki dalgaya kalan süre (ms); dalga sürüyorsa 0. */
  get dalgayaKalan(): number {
    return this.asama === 'ara' ? Math.max(0, DALGA_ARASI_MS - this.araBirikim) : 0
  }

  // --- Nişan ---

  aciAyarla(aci: number): void {
    this.aci = Math.min(ACI_MAX, Math.max(ACI_MIN, aci))
  }

  aciDegistir(fark: number): void {
    this.aciAyarla(this.aci + fark)
  }

  /** İşaretçinin bulunduğu noktaya göre açıyı ayarlar. */
  nisanlaNokta(x: number, y: number): void {
    const aci = (Math.atan2(y - MIZRAK_CIKIS_Y, Math.max(1, x - MIZRAK_CIKIS_X)) * 180) / Math.PI
    this.aciAyarla(aci)
  }

  /** Mızrak atar; oyun durmuşsa ya da bekleme dolmadıysa false döner. */
  at(): boolean {
    if (!this.calisiyor || !this.atisHazir) return false
    this.beklemeBirikim = 0
    const radyan = (this.aci * Math.PI) / 180
    this.atislar.push({
      id: this.sonrakiId++,
      x: MIZRAK_CIKIS_X,
      y: MIZRAK_CIKIS_Y,
      vx: Math.cos(radyan) * MIZRAK_HIZI,
      vy: Math.sin(radyan) * MIZRAK_HIZI,
      hasar: this.mizrakHasari,
      agir: true,
      tur: 'mizrak',
      element: this.element,
    })
    return true
  }

  // --- Yükseltme dükkânı ---

  yukseltmeSeviyesi(id: string): number {
    return this.yukseltmeler.get(id) ?? 0
  }

  /** Bu yükseltmenin sıradaki seviyesinin fiyatı; tavan dolduysa null. */
  yukseltmeFiyatiSimdi(id: string): number | null {
    const y = YUKSELTMELER.find((k) => k.id === id)
    if (!y) return null
    const seviye = this.yukseltmeSeviyesi(id)
    if (y.maxSeviye > 0 && seviye >= y.maxSeviye) return null
    return yukseltmeFiyati(y, seviye)
  }

  /** Şu an alınabilir mi? (para, tavan, kale canı dolu mu) */
  yukseltmeAlinabilir(id: string): boolean {
    if (this.asama === 'bitti') return false
    const fiyat = this.yukseltmeFiyatiSimdi(id)
    if (fiyat === null || this.altin < fiyat) return false
    // Kale tam canlıysa tamir parası boşa gitmesin.
    if (id === 'tamir' && this.kaleCani >= this.maxKaleCani) return false
    return true
  }

  /** Yükseltmeyi alıp etkisini uygular. */
  yukseltmeAl(id: string): boolean {
    if (!this.yukseltmeAlinabilir(id)) return false
    const y = YUKSELTMELER.find((k) => k.id === id)
    const fiyat = this.yukseltmeFiyatiSimdi(id)
    if (!y || fiyat === null) return false

    this.altin -= fiyat
    this.yukseltmeler.set(id, this.yukseltmeSeviyesi(id) + 1)

    if (y.tur === 'tamir') this.kaleCani = Math.min(this.maxKaleCani, this.kaleCani + TAMIR_MIKTARI)
    // Duvar yükseltmesi azami canı arttırır; kazanılan can hemen verilsin.
    else if (y.tur === 'kale') this.kaleCani += KALE_BONUSU
    // Element alındığı gibi etkin olsun, oyuncu ayrıca seçmek zorunda kalmasın.
    else if (y.tur === 'element' && y.element) this.element = y.element
    else if (y.tur === 'otomatik') this.otomatik = true

    return true
  }

  /** Etkin elementi değiştirir; alınmamış element seçilemez. */
  elementSec(element: Element): boolean {
    if (!this.acikElementler.includes(element)) return false
    this.element = element
    return true
  }

  /** Otomatik ateşi açar/kapatır; yükseltme alınmadıysa çalışmaz. */
  otomatikDegistir(): boolean {
    if (this.yukseltmeSeviyesi('otomatik') === 0) return false
    this.otomatik = !this.otomatik
    return true
  }

  /**
   * Verilen noktaya en yakın düşen atış açısını arar.
   *
   * Yerçekimli yayın açısını kapalı formülle çözmek yerine mevcut yay
   * simülasyonunu tarıyoruz: açı aralığı küçük ve atış seyrek olduğu için
   * ucuz, ayrıca nişan önizlemesiyle birebir aynı yolu kullanıyor.
   */
  otomatikAci(hedefX: number, hedefY: number): number {
    let enIyi = ACI_BASLANGIC
    let enKisa = Number.POSITIVE_INFINITY
    for (let aci = ACI_MIN; aci <= ACI_MAX; aci += OTOMATIK_ACI_ADIMI) {
      const yol = this.nisanYolu(aci)
      for (const nokta of yol) {
        const uzaklik = Math.hypot(nokta.x - hedefX, nokta.y - hedefY)
        if (uzaklik >= enKisa) continue
        enKisa = uzaklik
        enIyi = aci
      }
    }
    return enIyi
  }

  // --- Kuleler ---

  /** Yuvadaki kulenin bir sonraki basamağının fiyatı; sıra dolduysa null. */
  kuleFiyati(yuva: number, tip: number): number | null {
    const kule = this.kuleler[yuva]
    if (!kule) return KULE_TIPLERI[tip].fiyat[0]
    if (kule.tip !== tip || kule.seviye >= KULE_MAX_SEVIYE) return null
    return KULE_TIPLERI[kule.tip].fiyat[kule.seviye] ?? null
  }

  /** Yuvadaki kuleyi bir seviye yükseltir. */
  kuleYukselt(yuva: number): boolean {
    const kule = this.kuleler[yuva]
    if (!kule || this.asama === 'bitti') return false
    if (kule.seviye >= KULE_MAX_SEVIYE) return false
    const fiyat = KULE_TIPLERI[kule.tip].fiyat[kule.seviye]
    if (fiyat === undefined || this.altin < fiyat) return false

    this.altin -= fiyat
    kule.seviye++
    // Yeni seviyenin atışı beklemesin.
    kule.atisBirikim = KULE_TIPLERI[kule.tip].aralikMs[kule.seviye - 1]
    return true
  }

  /** Boş yuvaya kule kurar; para yetmezse ya da yuva doluysa false döner. */
  kuleAl(yuva: number, tip: number): boolean {
    if (this.asama === 'bitti') return false
    if (yuva < 0 || yuva >= this.kuleler.length) return false
    if (this.kuleler[yuva]) return false
    const fiyat = KULE_TIPLERI[tip]?.fiyat[0]
    if (fiyat === undefined || this.altin < fiyat) return false

    this.altin -= fiyat
    // İlk atış hemen gelsin, oyuncu aldığını görsün.
    this.kuleler[yuva] = { yuva, tip, seviye: 1, atisBirikim: KULE_TIPLERI[tip].aralikMs[0] }
    return true
  }

  /**
   * Nişan önizlemesi: mızrağın izleyeceği yay. Son nokta düşeceği yerdir,
   * sahne oraya hayalet koyar.
   */
  nisanYolu(aci = this.aci): { x: number; y: number }[] {
    const radyan = (aci * Math.PI) / 180
    const sn = NISAN_ADIM_MS / 1000
    let x = MIZRAK_CIKIS_X
    let y = MIZRAK_CIKIS_Y
    const vx = Math.cos(radyan) * MIZRAK_HIZI
    let vy = Math.sin(radyan) * MIZRAK_HIZI
    const yol = [{ x, y }]

    for (let i = 0; i < NISAN_MAX_ADIM; i++) {
      vy += YERCEKIMI * sn
      x += vx * sn
      y += vy * sn
      yol.push({ x, y })
      if (y >= ZEMIN_Y || x > GAME_WIDTH) break
    }
    return yol
  }

  // --- Simülasyon ---

  ilerlet(dt: number): AdimSonucu {
    const sonuc = bosSonuc()
    // 'hazir' ve duraklamada hiçbir şey ilerlemez.
    if (!this.calisiyor) return sonuc

    this.simBirikim = Math.min(this.simBirikim + dt, MAX_BIRIKIM_MS)
    while (this.simBirikim >= SIM_ADIM_MS) {
      this.simBirikim -= SIM_ADIM_MS
      this.adim(SIM_ADIM_MS, sonuc)
      // Kale düştüyse kalan alt adımları koşturmayalım.
      if (sonuc.oyunBitti) break
    }
    return sonuc
  }

  private adim(dt: number, sonuc: AdimSonucu): void {
    const sn = dt / 1000
    this.beklemeBirikim = Math.min(this.beklemeBirikim + dt, this.atisBeklemesi)

    if (this.asama === 'ara') {
      this.araBirikim += dt
      if (this.araBirikim >= DALGA_ARASI_MS) {
        this.dalgaBaslat()
        sonuc.yeniDalga = this.dalga
      }
    } else {
      this.dogusIlerlet(dt)
    }

    this.otomatikAtes()
    this.kuleIlerlet(dt, sonuc)
    this.durumlariIlerlet(dt, sonuc)
    this.atisIlerlet(sn, sonuc)
    this.canavarIlerlet(sn, dt, sonuc)

    if (this.kaleCani <= 0) {
      this.kaleCani = 0
      this.asama = 'bitti'
      sonuc.oyunBitti = true
      return
    }

    // Dalga temizlendi: bonus ver, hazırlık payı başlat.
    if (this.asama === 'dalga' && this.kalanDogus === 0 && this.canavarlar.length === 0) {
      this.skor += DALGA_BONUSU
      this.altin += DALGA_ALTIN_BONUSU
      sonuc.bitenDalga = this.dalga
      this.asama = 'ara'
      this.araBirikim = 0
    }
  }

  /** Otomatik ateş açıksa en öndeki canavara nişan alıp atar. */
  private otomatikAtes(): void {
    if (!this.otomatik || !this.atisHazir || this.canavarlar.length === 0) return
    // Kaleye en yakın canavar öncelikli; uçanı mızrak vurmaz, onu atla.
    let hedef: Canavar | null = null
    for (const c of this.canavarlar) {
      if (this.tipler[c.tip].ucar) continue
      if (!hedef || c.x < hedef.x) hedef = c
    }
    if (!hedef) return

    const bilgi = this.tipler[hedef.tip]
    this.aciAyarla(this.otomatikAci(hedef.x, canavarAyakY(bilgi) - bilgi.boy / 2))
    this.at()
  }

  /** Kuleler menzillerindeki en öndeki canavara ok atar. */
  private kuleIlerlet(dt: number, sonuc: AdimSonucu): void {
    for (const kule of this.kuleler) {
      if (!kule) continue
      const bilgi = KULE_TIPLERI[kule.tip]
      const basamak = kule.seviye - 1
      kule.atisBirikim = Math.min(kule.atisBirikim + dt, bilgi.aralikMs[basamak])
      if (kule.atisBirikim < bilgi.aralikMs[basamak]) continue

      const kuleX = KULE_YUVALARI[kule.yuva]
      const hedef = this.enOndekiHedef(kuleX, bilgi.menzil[basamak])
      if (!hedef) continue

      kule.atisBirikim = 0
      this.okAt(kuleX, kule.seviye, hedef, bilgi.hasar[basamak])
      sonuc.kuleAtti = true
    }
  }

  /** Menzildeki, kaleye en yakın canavar. */
  private enOndekiHedef(kuleX: number, menzil: number): Canavar | null {
    let hedef: Canavar | null = null
    for (const c of this.canavarlar) {
      if (Math.abs(c.x - kuleX) > menzil) continue
      if (!hedef || c.x < hedef.x) hedef = c
    }
    return hedef
  }

  private okAt(kuleX: number, seviye: number, hedef: Canavar, hasar: number): void {
    const bilgi = this.tipler[hedef.tip]
    // Ok mazgal hattından çıkar; kule yükseldikçe başlangıç da yükselir.
    const baslangicY = kuleAtisY(seviye)
    // Gövdenin ortasına nişan al (uçanlarda havadaki gövdeye).
    const hedefY = canavarAyakY(bilgi) - bilgi.boy * 0.5
    const uzaklik = Math.hypot(hedef.x - kuleX, hedefY - baslangicY) || 1

    this.atislar.push({
      id: this.sonrakiId++,
      x: kuleX,
      y: baslangicY,
      vx: ((hedef.x - kuleX) / uzaklik) * OK_HIZI,
      vy: ((hedefY - baslangicY) / uzaklik) * OK_HIZI,
      hasar,
      agir: false,
      tur: 'ok',
      element: 'normal',
    })
  }

  private dalgaBaslat(): void {
    this.dalga++
    this.asama = 'dalga'
    // Şef dalgalarında bir fazla doğuş: sonuncusu şef olur.
    this.kalanDogus = dalgaCanavarSayisi(this.dalga) + (patronDalgasiMi(this.dalga) ? 1 : 0)
    this.dogusBirikim = 0
  }

  private dogusIlerlet(dt: number): void {
    if (this.kalanDogus === 0) return
    this.dogusBirikim += dt
    const aralik = Math.max(DOGUS_ARALIK_MIN, DOGUS_ARALIK_MS - (this.dalga - 1) * DOGUS_ARALIK_AZALMA)
    if (this.dogusBirikim < aralik) return
    this.dogusBirikim = 0
    this.kalanDogus--
    // Şef dalgasının son doğuşu şeftir; ondan önce sıradan canavarlar gelir.
    const patronSirasi = patronDalgasiMi(this.dalga) && this.kalanDogus === 0
    this.canavarDogur(patronSirasi ? this.patronTipi() : this.tipSec())
  }

  /** Şef tipinin sırası; tablo değişirse ilk patron işaretli tip bulunur. */
  private patronTipi(): number {
    const sira = this.tipler.findIndex((t) => t.patron)
    return sira >= 0 ? sira : 0
  }

  private canavarDogur(tip: number): void {
    const bilgi = this.tipler[tip]
    // Can ve ödül doğduğu dalgaya göre ölçeklenir.
    const can = Math.round(bilgi.can * dalgaCanCarpani(this.dalga))
    const odul = dalgaOdulCarpani(this.dalga) * dunya(this.dunyaSira).odulCarpani

    this.canavarlar.push({
      id: this.sonrakiId++,
      tip,
      x: DOGUS_X,
      can,
      maxCan: can,
      altin: Math.round(bilgi.altin * odul),
      puan: Math.round(bilgi.puan * odul),
      durum: 'yuruyor',
      // Faz rastgele başlasın; hepsi aynı anda aynı bacağı atmasın.
      faz: this.random(),
      vurusBirikim: 0,
      yanmaKalan: 0,
      yanmaTik: 0,
      yavaslikKalan: 0,
    })
  }

  /**
   * Dalgaya açılmış tipler arasından seçer.
   *
   * Başta zayıflar sık çıkar; dalga ilerledikçe ağırlık tersine döner ve
   * TIP_KAYMA_DALGA'ya gelindiğinde güçlüler baskın olur.
   */
  private tipSec(): number {
    const acik: number[] = []
    for (let i = 0; i < this.tipler.length; i++) {
      // Şef rastgele doğmaz; yalnız dalga sonunda gelir.
      if (this.tipler[i].patron) continue
      if (this.dalga >= this.tipler[i].ilkDalga) acik.push(i)
    }
    if (acik.length === 0) return 0

    // Ağırlık açık tiplerin kendi sırasına göre hesaplanır; tabloya yeni tip
    // eklemek (ya da şefi dışarıda bırakmak) dengeyi kaydırmasın.
    const kayma = Math.min(1, Math.max(0, this.dalga - 1) / TIP_KAYMA_DALGA)
    const agirlik = acik.map((_, sira) => {
      const zayifAgirlik = acik.length - sira
      const gucluAgirlik = sira + 1
      return zayifAgirlik * (1 - kayma) + gucluAgirlik * kayma
    })

    const toplam = agirlik.reduce((a, b) => a + b, 0)
    let secim = this.random() * toplam
    for (let k = 0; k < acik.length; k++) {
      secim -= agirlik[k]
      if (secim <= 0) return acik[k]
    }
    return acik[acik.length - 1]
  }

  /** Mızrak ve ok aynı yoldan ilerler; fark yalnızca yerçekimi. */
  private atisIlerlet(sn: number, sonuc: AdimSonucu): void {
    for (let i = this.atislar.length - 1; i >= 0; i--) {
      const m = this.atislar[i]
      if (m.agir) m.vy += YERCEKIMI * sn
      m.x += m.vx * sn
      m.y += m.vy * sn

      const hedef = this.carpisan(m)
      if (hedef) {
        this.hasarVer(hedef, m, sonuc)
        this.atislar.splice(i, 1)
        continue
      }
      if (m.y >= ZEMIN_Y) {
        // Ok yere saplanmaz, mızrak saplanır; ikisi de sahneden çıkar.
        if (m.tur === 'mizrak') sonuc.saplananlar.push({ x: m.x, aci: Math.atan2(m.vy, m.vx) })
        this.atislar.splice(i, 1)
        continue
      }
      if (m.x > GAME_WIDTH + MIZRAK_TASMA || m.x < -MIZRAK_TASMA) this.atislar.splice(i, 1)
    }
  }

  /** Atışın ucu bir canavarın gövdesine girdi mi? */
  private carpisan(m: Atis): Canavar | null {
    if (m.y > ZEMIN_Y) return null
    for (const c of this.canavarlar) {
      const bilgi = this.tipler[c.tip]
      // Uçana mızrak değmez; yalnız kule oku vurur.
      if (bilgi.ucar && m.tur === 'mizrak') continue
      if (Math.abs(m.x - c.x) > bilgi.en / 2 + MIZRAK_TEMAS) continue

      const ayak = canavarAyakY(bilgi)
      if (m.y > ayak + MIZRAK_TEMAS) continue
      if (m.y < ayak - bilgi.boy - MIZRAK_TEMAS) continue
      return c
    }
    return null
  }

  private hasarVer(c: Canavar, m: Atis, sonuc: AdimSonucu): void {
    // Zırh her isabetten sabit hasar yutar ama en az 1 hasar hep geçer.
    c.can -= Math.max(1, m.hasar - this.tipler[c.tip].zirh)
    if (c.can > 0) {
      sonuc.isabetler.push({ canavarId: c.id, x: m.x, y: m.y, tip: c.tip, oldu: false, puan: 0 })
      this.elementUygula(c, m, sonuc)
      return
    }
    // Ölse de şimşek komşulara atlasın.
    this.oldur(c, m.y, sonuc)
    this.elementUygula(c, m, sonuc)
  }

  /** Elementin yan etkisi: yakma, yavaşlatma ya da komşulara atlama. */
  private elementUygula(c: Canavar, m: Atis, sonuc: AdimSonucu): void {
    if (m.element === 'alev') {
      c.yanmaKalan = ALEV_SURE_MS
      c.yanmaTik = 0
      return
    }
    if (m.element === 'buz') {
      c.yavaslikKalan = BUZ_SURE_MS
      return
    }
    if (m.element !== 'simsek') return

    // Şimşek: en yakın komşulara atlar. Zırhı yine hesaba katarız.
    const komsular = this.canavarlar
      .filter((k) => k !== c && Math.abs(k.x - c.x) <= SIMSEK_MENZIL)
      .sort((a, b) => Math.abs(a.x - c.x) - Math.abs(b.x - c.x))
      .slice(0, SIMSEK_HEDEF)

    for (const komsu of komsular) {
      komsu.can -= Math.max(1, SIMSEK_HASAR - this.tipler[komsu.tip].zirh)
      sonuc.zincirler.push({ x1: c.x, y1: m.y, x2: komsu.x, y2: canavarAyakY(this.tipler[komsu.tip]) - this.tipler[komsu.tip].boy / 2 })
      if (komsu.can > 0) {
        sonuc.isabetler.push({ canavarId: komsu.id, x: komsu.x, y: m.y, tip: komsu.tip, oldu: false, puan: 0 })
        continue
      }
      this.oldur(komsu, m.y, sonuc)
    }
  }

  /** Canavarı listeden çıkarır, ödülünü verir ve isabet olayını yazar. */
  private oldur(c: Canavar, y: number, sonuc: AdimSonucu): void {
    sonuc.isabetler.push({ canavarId: c.id, x: c.x, y, tip: c.tip, oldu: true, puan: c.puan })
    this.skor += c.puan
    this.altin += c.altin
    this.oldurulen++
    const yer = this.canavarlar.indexOf(c)
    if (yer >= 0) this.canavarlar.splice(yer, 1)
  }

  /** Yanma ve yavaşlama sayaçlarını ilerletir; yanma hasarını uygular. */
  private durumlariIlerlet(dt: number, sonuc: AdimSonucu): void {
    for (let i = this.canavarlar.length - 1; i >= 0; i--) {
      const c = this.canavarlar[i]
      if (c.yavaslikKalan > 0) c.yavaslikKalan = Math.max(0, c.yavaslikKalan - dt)
      if (c.yanmaKalan <= 0) continue

      c.yanmaKalan = Math.max(0, c.yanmaKalan - dt)
      c.yanmaTik += dt
      if (c.yanmaTik < ALEV_ARALIK_MS) continue
      c.yanmaTik = 0
      // Alev zırhı yok sayar: zırhlıya karşı işe yarayan yol bu.
      c.can -= ALEV_HASAR
      if (c.can > 0) {
        sonuc.isabetler.push({ canavarId: c.id, x: c.x, y: canavarAyakY(this.tipler[c.tip]) - this.tipler[c.tip].boy / 2, tip: c.tip, oldu: false, puan: 0 })
        continue
      }
      this.oldur(c, canavarAyakY(this.tipler[c.tip]) - this.tipler[c.tip].boy / 2, sonuc)
    }
  }

  private canavarIlerlet(sn: number, dt: number, sonuc: AdimSonucu): void {
    const carpan = 1 + Math.max(0, this.dalga - 1) * DALGA_HIZ_ARTISI

    for (const c of this.canavarlar) {
      const bilgi = this.tipler[c.tip]

      if (c.durum === 'yuruyor') {
        const yavaslik = c.yavaslikKalan > 0 ? BUZ_ORAN : 1
        const yol = bilgi.hiz * carpan * yavaslik * sn
        c.x -= yol
        // Faz yola bağlı: yavaş canavar yavaş adım atsın.
        c.faz = (c.faz + yol / ADIM_UZUNLUK) % 1
        if (c.x <= DURAK_X) {
          c.x = DURAK_X
          c.durum = 'vuruyor'
          c.vurusBirikim = 0
          c.faz = 0
        }
        continue
      }

      c.vurusBirikim += dt
      c.faz = (c.faz + dt / bilgi.vurusAralikMs) % 1
      if (c.vurusBirikim < bilgi.vurusAralikMs) continue
      c.vurusBirikim = 0
      this.kaleCani -= bilgi.vurusHasari
      sonuc.kaleVuruldu = true
    }
  }
}
