/**
 * Kale Savunması mantığı — Phaser'dan bağımsız, Node'da tek başına test edilir.
 *
 * Sahne yalnızca burada tutulan durumu çizer: canavarların yeri, uçan mızraklar,
 * kale canı ve dalga akışı hep bu sınıfta ilerler. Simülasyon sabit adımla
 * (SIM_ADIM_MS) koşar; böylece hızlı mızrak canavarın içinden geçip gitmez ve
 * sekme arka planda kalınca oyun birden fırlamaz.
 */

import { type Uretec } from '../../../shared/rastgele.ts'
import {
  ACI_BASLANGIC,
  ACI_MAX,
  ACI_MIN,
  ADIM_UZUNLUK,
  ATIS_BEKLEME_MS,
  CANAVAR_TIPLERI,
  DALGA_ALTIN_BONUSU,
  DALGA_ARASI_MS,
  DALGA_BONUSU,
  DALGA_HIZ_ARTISI,
  DOGUS_ARALIK_AZALMA,
  DOGUS_ARALIK_MIN,
  DOGUS_ARALIK_MS,
  DOGUS_X,
  DURAK_X,
  GAME_WIDTH,
  ILK_ARA_MS,
  KALE_CANI,
  MAX_BIRIKIM_MS,
  MIZRAK_CIKIS_X,
  MIZRAK_CIKIS_Y,
  MIZRAK_HASARI,
  MIZRAK_HIZI,
  MIZRAK_TASMA,
  MIZRAK_TEMAS,
  NISAN_ADIM_MS,
  NISAN_MAX_ADIM,
  SIM_ADIM_MS,
  YERCEKIMI,
  ZEMIN_Y,
  dalgaCanavarSayisi,
} from '../config/constants.ts'

export type CanavarDurum = 'yuruyor' | 'vuruyor'

export interface Canavar {
  id: number
  /** CANAVAR_TIPLERI dizisindeki sıra. */
  tip: number
  x: number
  can: number
  maxCan: number
  durum: CanavarDurum
  /** Yürüme/vuruş animasyon fazı (0..1) — sahne bacakları buna göre çizer. */
  faz: number
  vurusBirikim: number
}

export interface Mizrak {
  id: number
  x: number
  y: number
  vx: number
  vy: number
}

export interface Isabet {
  canavarId: number
  x: number
  y: number
  tip: number
  /** Bu isabetle öldü mü? */
  oldu: boolean
}

/** Bir karede olan biten: sahne bunları görsele çevirir. */
export interface AdimSonucu {
  isabetler: Isabet[]
  /** Yere saplanan mızraklar. */
  saplananlar: { x: number; aci: number }[]
  kaleVuruldu: boolean
  /** Bu adımda başlayan dalganın numarası (yoksa null). */
  yeniDalga: number | null
  /** Bu adımda tamamlanan dalganın numarası (yoksa null). */
  bitenDalga: number | null
  oyunBitti: boolean
}

export type Asama = 'ara' | 'dalga' | 'bitti'

function bosSonuc(): AdimSonucu {
  return {
    isabetler: [],
    saplananlar: [],
    kaleVuruldu: false,
    yeniDalga: null,
    bitenDalga: null,
    oyunBitti: false,
  }
}

export class KaleSavunmasi {
  dalga = 0
  kaleCani = KALE_CANI
  skor = 0
  /** Oyun parası — kuleler bununla alınacak. */
  altin = 0
  oldurulen = 0
  asama: Asama = 'ara'
  /** Nişan açısı (derece; 0 = sağa yatay, eksi = yukarı). */
  aci = ACI_BASLANGIC

  readonly canavarlar: Canavar[] = []
  readonly mizraklar: Mizrak[] = []

  /** Testlerde kestirilebilir olsun diye üreteç dışarıdan verilebilir. */
  private readonly random: Uretec
  private sonrakiId = 1
  private kalanDogus = 0
  private dogusBirikim = 0
  private araBirikim = 0
  private beklemeBirikim = ATIS_BEKLEME_MS
  private simBirikim = 0

  constructor(random: Uretec = Math.random) {
    this.random = random
    this.reset()
  }

  reset(): void {
    this.dalga = 0
    this.kaleCani = KALE_CANI
    this.skor = 0
    this.altin = 0
    this.oldurulen = 0
    this.asama = 'ara'
    this.aci = ACI_BASLANGIC
    this.canavarlar.length = 0
    this.mizraklar.length = 0
    this.sonrakiId = 1
    this.kalanDogus = 0
    this.dogusBirikim = 0
    // İlk dalga tam 3 saniye beklemesin.
    this.araBirikim = DALGA_ARASI_MS - ILK_ARA_MS
    this.beklemeBirikim = ATIS_BEKLEME_MS
    this.simBirikim = 0
  }

  get bitti(): boolean {
    return this.asama === 'bitti'
  }

  /** Atış hazır mı? */
  get atisHazir(): boolean {
    return this.beklemeBirikim >= ATIS_BEKLEME_MS
  }

  /** Bekleme çubuğu için 0..1. */
  get atisDolulugu(): number {
    return Math.min(1, this.beklemeBirikim / ATIS_BEKLEME_MS)
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

  /** Mızrak atar; bekleme dolmadıysa ya da oyun bittiyse false döner. */
  at(): boolean {
    if (this.asama === 'bitti' || !this.atisHazir) return false
    this.beklemeBirikim = 0
    const radyan = (this.aci * Math.PI) / 180
    this.mizraklar.push({
      id: this.sonrakiId++,
      x: MIZRAK_CIKIS_X,
      y: MIZRAK_CIKIS_Y,
      vx: Math.cos(radyan) * MIZRAK_HIZI,
      vy: Math.sin(radyan) * MIZRAK_HIZI,
    })
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
    if (this.asama === 'bitti') return sonuc

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
    this.beklemeBirikim = Math.min(this.beklemeBirikim + dt, ATIS_BEKLEME_MS)

    if (this.asama === 'ara') {
      this.araBirikim += dt
      if (this.araBirikim >= DALGA_ARASI_MS) {
        this.dalgaBaslat()
        sonuc.yeniDalga = this.dalga
      }
    } else {
      this.dogusIlerlet(dt)
    }

    this.mizrakIlerlet(sn, sonuc)
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

  private dalgaBaslat(): void {
    this.dalga++
    this.asama = 'dalga'
    this.kalanDogus = dalgaCanavarSayisi(this.dalga)
    this.dogusBirikim = 0
  }

  private dogusIlerlet(dt: number): void {
    if (this.kalanDogus === 0) return
    this.dogusBirikim += dt
    const aralik = Math.max(DOGUS_ARALIK_MIN, DOGUS_ARALIK_MS - (this.dalga - 1) * DOGUS_ARALIK_AZALMA)
    if (this.dogusBirikim < aralik) return
    this.dogusBirikim = 0
    this.kalanDogus--
    this.canavarDogur()
  }

  private canavarDogur(): void {
    const tip = this.tipSec()
    const bilgi = CANAVAR_TIPLERI[tip]
    this.canavarlar.push({
      id: this.sonrakiId++,
      tip,
      x: DOGUS_X,
      can: bilgi.can,
      maxCan: bilgi.can,
      durum: 'yuruyor',
      // Faz rastgele başlasın; hepsi aynı anda aynı bacağı atmasın.
      faz: this.random(),
      vurusBirikim: 0,
    })
  }

  /** Dalgaya açılmış tipler arasından seçer; güçlüler daha seyrek çıkar. */
  private tipSec(): number {
    const acik: number[] = []
    for (let i = 0; i < CANAVAR_TIPLERI.length; i++) {
      if (this.dalga >= CANAVAR_TIPLERI[i].ilkDalga) acik.push(i)
    }
    if (acik.length === 0) return 0

    const agirlik = acik.map((i) => CANAVAR_TIPLERI.length - i)
    const toplam = agirlik.reduce((a, b) => a + b, 0)
    let secim = this.random() * toplam
    for (let k = 0; k < acik.length; k++) {
      secim -= agirlik[k]
      if (secim <= 0) return acik[k]
    }
    return acik[acik.length - 1]
  }

  private mizrakIlerlet(sn: number, sonuc: AdimSonucu): void {
    for (let i = this.mizraklar.length - 1; i >= 0; i--) {
      const m = this.mizraklar[i]
      m.vy += YERCEKIMI * sn
      m.x += m.vx * sn
      m.y += m.vy * sn

      const hedef = this.carpisan(m)
      if (hedef) {
        this.hasarVer(hedef, m, sonuc)
        this.mizraklar.splice(i, 1)
        continue
      }
      if (m.y >= ZEMIN_Y) {
        sonuc.saplananlar.push({ x: m.x, aci: Math.atan2(m.vy, m.vx) })
        this.mizraklar.splice(i, 1)
        continue
      }
      if (m.x > GAME_WIDTH + MIZRAK_TASMA) this.mizraklar.splice(i, 1)
    }
  }

  /** Mızrağın ucu bir canavarın gövdesine girdi mi? */
  private carpisan(m: Mizrak): Canavar | null {
    if (m.y > ZEMIN_Y) return null
    for (const c of this.canavarlar) {
      const bilgi = CANAVAR_TIPLERI[c.tip]
      if (Math.abs(m.x - c.x) > bilgi.en / 2 + MIZRAK_TEMAS) continue
      if (m.y < ZEMIN_Y - bilgi.boy - MIZRAK_TEMAS) continue
      return c
    }
    return null
  }

  private hasarVer(c: Canavar, m: Mizrak, sonuc: AdimSonucu): void {
    c.can -= MIZRAK_HASARI
    const oldu = c.can <= 0
    sonuc.isabetler.push({ canavarId: c.id, x: m.x, y: m.y, tip: c.tip, oldu })
    if (!oldu) return

    const bilgi = CANAVAR_TIPLERI[c.tip]
    this.skor += bilgi.puan
    this.altin += bilgi.altin
    this.oldurulen++
    const yer = this.canavarlar.indexOf(c)
    if (yer >= 0) this.canavarlar.splice(yer, 1)
  }

  private canavarIlerlet(sn: number, dt: number, sonuc: AdimSonucu): void {
    const carpan = 1 + Math.max(0, this.dalga - 1) * DALGA_HIZ_ARTISI

    for (const c of this.canavarlar) {
      const bilgi = CANAVAR_TIPLERI[c.tip]

      if (c.durum === 'yuruyor') {
        const yol = bilgi.hiz * carpan * sn
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
