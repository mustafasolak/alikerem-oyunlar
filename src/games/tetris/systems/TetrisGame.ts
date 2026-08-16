/**
 * Tetris'in saf mantığı. Phaser'dan bağımsız, tek başına test edilebilir.
 * Tahta satır dizisidir; hücre boşsa null, doluysa taşın tipini tutar.
 */

import { karistir, type Uretec } from '../../../shared/rastgele.ts'
import {
  COLS,
  DUVAR_ITMELERI,
  ROWS,
  SATIR_PUANLARI,
  SERT_DUSUS_PUANI,
  SEVIYE_SATIR,
  TAS_SEKILLERI,
  TAS_TIPLERI,
  YUMUSAK_DUSUS_PUANI,
  type TasTipi,
} from '../config/constants.ts'

export type Durum = 'oynaniyor' | 'durakladi' | 'bitti'
export type Hucre = TasTipi | null

export interface Tas {
  tip: TasTipi
  matris: number[][]
  satir: number
  sutun: number
}

export interface KilitSonucu {
  kilitlendi: boolean
  /** Temizlenen satırların indeksleri. */
  temizlenen: number[]
  bitti: boolean
}

/** Matrisi saat yönünde çevirir. */
export function cevir(matris: number[][]): number[][] {
  const n = matris.length
  return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => matris[n - 1 - c][r]))
}

export class TetrisGame {
  readonly sutun: number
  readonly satir: number

  tahta: Hucre[][] = []
  aktif: Tas | null = null
  siradaki: TasTipi = 'I'
  skor = 0
  satirSayisi = 0
  seviye = 1
  durum: Durum = 'oynaniyor'

  private torba: TasTipi[] = []
  private readonly random: Uretec

  constructor(sutun: number = COLS, satir: number = ROWS, random: Uretec = Math.random) {
    this.sutun = sutun
    this.satir = satir
    this.random = random
    this.reset()
  }

  reset(): void {
    this.tahta = Array.from({ length: this.satir }, () => Array<Hucre>(this.sutun).fill(null))
    this.skor = 0
    this.satirSayisi = 0
    this.seviye = 1
    this.durum = 'oynaniyor'
    this.torba = []
    this.siradaki = this.torbadanCek()
    this.yeniTas()
  }

  duraklat(): void {
    if (this.durum === 'oynaniyor') this.durum = 'durakladi'
    else if (this.durum === 'durakladi') this.durum = 'oynaniyor'
  }

  get bitti(): boolean {
    return this.durum === 'bitti'
  }

  // --- Hareket ---

  /** Yatay kaydırma. Başarılıysa true. */
  kaydir(yon: -1 | 1): boolean {
    if (!this.aktif || this.durum !== 'oynaniyor') return false
    if (this.carpisiyor(this.aktif.matris, this.aktif.satir, this.aktif.sutun + yon)) return false
    this.aktif.sutun += yon
    return true
  }

  /** Saat yönünde çevirir; duvara denk gelirse yana iterek dener. */
  cevirmeyiDene(): boolean {
    if (!this.aktif || this.durum !== 'oynaniyor') return false
    const yeni = cevir(this.aktif.matris)
    for (const itme of DUVAR_ITMELERI) {
      if (!this.carpisiyor(yeni, this.aktif.satir, this.aktif.sutun + itme)) {
        this.aktif.matris = yeni
        this.aktif.sutun += itme
        return true
      }
    }
    return false
  }

  /** Bir satır aşağı iner. İnemezse false (kilitlenmeye hazır demektir). */
  indir(oyuncuBasti = false): boolean {
    if (!this.aktif || this.durum !== 'oynaniyor') return false
    if (this.carpisiyor(this.aktif.matris, this.aktif.satir + 1, this.aktif.sutun)) return false
    this.aktif.satir++
    if (oyuncuBasti) this.skor += YUMUSAK_DUSUS_PUANI
    return true
  }

  /** Taşı dibe indirir ve kilitler. */
  sertDusur(): KilitSonucu {
    if (!this.aktif || this.durum !== 'oynaniyor') {
      return { kilitlendi: false, temizlenen: [], bitti: this.bitti }
    }
    let mesafe = 0
    while (!this.carpisiyor(this.aktif.matris, this.aktif.satir + 1, this.aktif.sutun)) {
      this.aktif.satir++
      mesafe++
    }
    this.skor += mesafe * SERT_DUSUS_PUANI
    return this.kilitle()
  }

  /** Aktif taşı tahtaya işler, satırları temizler, yeni taş çıkarır. */
  kilitle(): KilitSonucu {
    const aktif = this.aktif
    if (!aktif) return { kilitlendi: false, temizlenen: [], bitti: this.bitti }

    for (const { satir, sutun } of this.dolular(aktif.matris, aktif.satir, aktif.sutun)) {
      if (satir >= 0 && satir < this.satir) this.tahta[satir][sutun] = aktif.tip
    }

    const temizlenen = this.satirlariTemizle()
    if (temizlenen.length > 0) {
      this.satirSayisi += temizlenen.length
      this.skor += (SATIR_PUANLARI[temizlenen.length] ?? 0) * this.seviye
      this.seviye = Math.floor(this.satirSayisi / SEVIYE_SATIR) + 1
    }

    this.yeniTas()
    return { kilitlendi: true, temizlenen, bitti: this.bitti }
  }

  /** Aktif taş bu konumda dibe değiyor mu? */
  get yereDegdi(): boolean {
    if (!this.aktif) return false
    return this.carpisiyor(this.aktif.matris, this.aktif.satir + 1, this.aktif.sutun)
  }

  /** Hayalet taşın (düşeceği yerin) satır konumu. */
  get hayaletSatir(): number {
    if (!this.aktif) return 0
    let satir = this.aktif.satir
    while (!this.carpisiyor(this.aktif.matris, satir + 1, this.aktif.sutun)) satir++
    return satir
  }

  /** Bir matrisin dolu hücrelerinin tahta koordinatları. */
  dolular(matris: number[][], satir: number, sutun: number): { satir: number; sutun: number }[] {
    const sonuc: { satir: number; sutun: number }[] = []
    for (let r = 0; r < matris.length; r++) {
      for (let c = 0; c < matris[r].length; c++) {
        if (matris[r][c]) sonuc.push({ satir: satir + r, sutun: sutun + c })
      }
    }
    return sonuc
  }

  // --- Yardımcılar ---

  private carpisiyor(matris: number[][], satir: number, sutun: number): boolean {
    for (const hucre of this.dolular(matris, satir, sutun)) {
      if (hucre.sutun < 0 || hucre.sutun >= this.sutun) return true
      if (hucre.satir >= this.satir) return true
      // Tavanın üstü serbest: taş oraya doğarken çarpışma sayılmaz.
      if (hucre.satir >= 0 && this.tahta[hucre.satir][hucre.sutun]) return true
    }
    return false
  }

  private satirlariTemizle(): number[] {
    const temizlenen: number[] = []
    for (let r = 0; r < this.satir; r++) {
      if (this.tahta[r].every((hucre) => hucre !== null)) temizlenen.push(r)
    }
    if (temizlenen.length === 0) return temizlenen

    this.tahta = this.tahta.filter((_, r) => !temizlenen.includes(r))
    while (this.tahta.length < this.satir) {
      this.tahta.unshift(Array<Hucre>(this.sutun).fill(null))
    }
    return temizlenen
  }

  /** 7'li torba: her yedi taşta her tip bir kez gelir. */
  private torbadanCek(): TasTipi {
    if (this.torba.length === 0) this.torba = karistir(TAS_TIPLERI, this.random)
    return this.torba.pop()!
  }

  private yeniTas(): void {
    const tip = this.siradaki
    this.siradaki = this.torbadanCek()
    const matris = TAS_SEKILLERI[tip].map((row) => row.slice())
    const sutun = Math.floor((this.sutun - matris.length) / 2)
    const tas: Tas = { tip, matris, satir: 0, sutun }
    this.aktif = tas

    // Doğduğu yerde yer yoksa oyun biter.
    if (this.carpisiyor(matris, tas.satir, tas.sutun)) this.durum = 'bitti'
  }
}
