/**
 * Kelime Avı'nın saf mantığı: bulmaca üretimi ve seçim denetimi.
 * Phaser'dan bağımsız.
 */

import { KATEGORILER, TURKCE_ALFABE, kategoriKelimeleri, type Kategori } from '../../../shared/kelimeler.ts'
import { birSec, karistir, nTaneSec, tamsayi, type Uretec } from '../../../shared/rastgele.ts'
import { GRID_SIZE, KELIME_SAYISI, MAX_KELIME, MIN_KELIME, YERLESTIRME_DENEMESI } from '../config/constants.ts'

export interface Hucre {
  satir: number
  sutun: number
}

export interface Yerlesim {
  kelime: string
  hucreler: Hucre[]
}

/** Sekiz yön: yatay, dikey ve çaprazlar (ileri ve geri). */
const YONLER: Hucre[] = [
  { satir: 0, sutun: 1 },
  { satir: 0, sutun: -1 },
  { satir: 1, sutun: 0 },
  { satir: -1, sutun: 0 },
  { satir: 1, sutun: 1 },
  { satir: 1, sutun: -1 },
  { satir: -1, sutun: 1 },
  { satir: -1, sutun: -1 },
]

const ayniHucre = (a: Hucre, b: Hucre): boolean => a.satir === b.satir && a.sutun === b.sutun

export class WordSearch {
  readonly boyut: number

  kategori: Kategori = 'Hayvan'
  izgara: string[][] = []
  yerlesimler: Yerlesim[] = []
  readonly bulunanlar = new Set<string>()

  private readonly random: Uretec

  constructor(boyut: number = GRID_SIZE, random: Uretec = Math.random) {
    this.boyut = boyut
    this.random = random
    this.reset()
  }

  get kelimeler(): string[] {
    return this.yerlesimler.map((y) => y.kelime)
  }

  get kalan(): number {
    return this.yerlesimler.length - this.bulunanlar.size
  }

  get tamamlandi(): boolean {
    return this.yerlesimler.length > 0 && this.bulunanlar.size === this.yerlesimler.length
  }

  reset(): void {
    // Yeterince kelimesi olan bir kategori seç.
    const uygunKategoriler = KATEGORILER.filter(
      (k) => this.kategoriHavuzu(k).length >= KELIME_SAYISI,
    )
    this.kategori = birSec(uygunKategoriler.length > 0 ? uygunKategoriler : KATEGORILER, this.random)

    this.bulunanlar.clear()
    this.yerlesimler = []
    this.izgara = Array.from({ length: this.boyut }, () => Array<string>(this.boyut).fill(''))

    const adaylar = nTaneSec(this.kategoriHavuzu(this.kategori), KELIME_SAYISI, this.random).sort(
      (a, b) => b.length - a.length,
    )
    for (const kelime of adaylar) {
      const yerlesim = this.yerlestir(kelime)
      if (yerlesim) this.yerlesimler.push(yerlesim)
    }
    this.bosluklariDoldur()
  }

  /**
   * Seçilen iki uç arasındaki düz çizgi bir kelimeyle eşleşiyor mu?
   * Eşleşirse kelimeyi bulunmuş sayar ve döner.
   */
  secimiDene(bas: Hucre, son: Hucre): Yerlesim | null {
    const hucreler = this.cizgi(bas, son)
    if (!hucreler) return null

    for (const yerlesim of this.yerlesimler) {
      if (this.bulunanlar.has(yerlesim.kelime)) continue
      if (this.ayniYol(hucreler, yerlesim.hucreler)) {
        this.bulunanlar.add(yerlesim.kelime)
        return yerlesim
      }
    }
    return null
  }

  /** İki uç düz bir çizgi oluşturuyorsa aradaki hücreler, yoksa null. */
  cizgi(bas: Hucre, son: Hucre): Hucre[] | null {
    const dSatir = son.satir - bas.satir
    const dSutun = son.sutun - bas.sutun
    const uzunluk = Math.max(Math.abs(dSatir), Math.abs(dSutun)) + 1
    if (uzunluk < 2) return null
    // Yatay, dikey ya da tam çapraz olmalı.
    if (dSatir !== 0 && dSutun !== 0 && Math.abs(dSatir) !== Math.abs(dSutun)) return null

    const adim = { satir: Math.sign(dSatir), sutun: Math.sign(dSutun) }
    return Array.from({ length: uzunluk }, (_, i) => ({
      satir: bas.satir + adim.satir * i,
      sutun: bas.sutun + adim.sutun * i,
    }))
  }

  bulundu(kelime: string): boolean {
    return this.bulunanlar.has(kelime)
  }

  /** Bulunmuş kelimelerin kapladığı hücreler (boyama için). */
  bulunanHucreler(): Hucre[] {
    return this.yerlesimler.filter((y) => this.bulunanlar.has(y.kelime)).flatMap((y) => y.hucreler)
  }

  // --- Üretim ---

  private kategoriHavuzu(kategori: Kategori): string[] {
    return kategoriKelimeleri(kategori)
      .map((k) => k.kelime)
      .filter((k) => k.length >= MIN_KELIME && k.length <= Math.min(MAX_KELIME, this.boyut))
  }

  private yerlestir(kelime: string): Yerlesim | null {
    const harfler = [...kelime]

    for (let deneme = 0; deneme < YERLESTIRME_DENEMESI; deneme++) {
      const yon = birSec(YONLER, this.random)
      const satir = tamsayi(this.boyut, this.random)
      const sutun = tamsayi(this.boyut, this.random)

      const hucreler: Hucre[] = harfler.map((_, i) => ({
        satir: satir + yon.satir * i,
        sutun: sutun + yon.sutun * i,
      }))

      if (hucreler.some((h) => h.satir < 0 || h.satir >= this.boyut || h.sutun < 0 || h.sutun >= this.boyut)) {
        continue
      }
      // Dolu hücrelerde harf aynı olmalı (kesişmeye izin var).
      const uyumlu = hucreler.every((h, i) => {
        const mevcut = this.izgara[h.satir][h.sutun]
        return mevcut === '' || mevcut === harfler[i]
      })
      if (!uyumlu) continue

      hucreler.forEach((h, i) => {
        this.izgara[h.satir][h.sutun] = harfler[i]
      })
      return { kelime, hucreler }
    }
    return null
  }

  private bosluklariDoldur(): void {
    // Kelimelerin harflerini de havuza katıyoruz ki dolgu yabancı durmasın.
    const havuz = karistir([...TURKCE_ALFABE, ...this.kelimeler.join('')], this.random)
    for (let satir = 0; satir < this.boyut; satir++) {
      for (let sutun = 0; sutun < this.boyut; sutun++) {
        if (this.izgara[satir][sutun] === '') {
          this.izgara[satir][sutun] = birSec(havuz, this.random)
        }
      }
    }
  }

  private ayniYol(a: Hucre[], b: Hucre[]): boolean {
    if (a.length !== b.length) return false
    const ileri = a.every((h, i) => ayniHucre(h, b[i]))
    const geri = a.every((h, i) => ayniHucre(h, b[b.length - 1 - i]))
    return ileri || geri
  }
}
