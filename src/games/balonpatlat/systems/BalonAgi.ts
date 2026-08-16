/**
 * Bubble Shooter mantığı: altıgen dizilimli balon ızgarası.
 * Tek satırlar yarım hücre sağa kayar; komşuluk buna göre hesaplanır.
 */

import { tamsayi, type Uretec } from '../../../shared/rastgele.ts'
import { BASLANGIC_SATIR, RENK_SAYISI, SATIR, SUTUN } from '../config/constants.ts'

export interface Hucre {
  satir: number
  sutun: number
}

export interface PatlamaSonucu {
  yerlesti: Hucre | null
  patlayanlar: Hucre[]
  dusenler: Hucre[]
}

export class BalonAgi {
  /** -1 boş, aksi hâlde renk numarası. */
  izgara: number[] = []
  siradaki = 0

  private readonly random: Uretec

  constructor(random: Uretec = Math.random) {
    this.random = random
    this.reset()
  }

  index(s: number, t: number): number {
    return s * SUTUN + t
  }

  /** Tek satırlar yarım hücre kaymış olur. */
  kaydirmaliMi(satir: number): boolean {
    return satir % 2 === 1
  }

  dolu(s: number, t: number): boolean {
    if (s < 0 || s >= SATIR || t < 0 || t >= SUTUN) return false
    return this.izgara[this.index(s, t)] !== -1
  }

  reset(): void {
    this.izgara = Array<number>(SATIR * SUTUN).fill(-1)
    for (let s = 0; s < BASLANGIC_SATIR; s++) {
      for (let t = 0; t < SUTUN; t++) {
        this.izgara[this.index(s, t)] = tamsayi(RENK_SAYISI, this.random)
      }
    }
    this.siradaki = this.rastgeleRenk()
  }

  rastgeleRenk(): number {
    const mevcut = [...new Set(this.izgara.filter((v) => v !== -1))]
    if (mevcut.length === 0) return tamsayi(RENK_SAYISI, this.random)
    return mevcut[tamsayi(mevcut.length, this.random)]
  }

  komsular(s: number, t: number): Hucre[] {
    const kayma = this.kaydirmaliMi(s) ? 1 : -1
    const adaylar: Hucre[] = [
      { satir: s, sutun: t - 1 },
      { satir: s, sutun: t + 1 },
      { satir: s - 1, sutun: t },
      { satir: s + 1, sutun: t },
      { satir: s - 1, sutun: t + kayma },
      { satir: s + 1, sutun: t + kayma },
    ]
    return adaylar.filter((k) => k.satir >= 0 && k.satir < SATIR && k.sutun >= 0 && k.sutun < SUTUN)
  }

  /** Aynı renkten bağlı grup. */
  grup(s: number, t: number): Hucre[] {
    const renk = this.izgara[this.index(s, t)]
    if (renk === -1) return []
    const gorulen = new Set<number>([this.index(s, t)])
    const yigin: Hucre[] = [{ satir: s, sutun: t }]
    const sonuc: Hucre[] = []

    while (yigin.length) {
      const k = yigin.pop()!
      sonuc.push(k)
      for (const komsu of this.komsular(k.satir, k.sutun)) {
        const i = this.index(komsu.satir, komsu.sutun)
        if (gorulen.has(i) || this.izgara[i] !== renk) continue
        gorulen.add(i)
        yigin.push(komsu)
      }
    }
    return sonuc
  }

  /** Tavana bağlı olmayan balonlar düşer. */
  private dusenleriBul(): Hucre[] {
    const bagli = new Set<number>()
    const yigin: Hucre[] = []
    for (let t = 0; t < SUTUN; t++) {
      if (this.dolu(0, t)) {
        bagli.add(this.index(0, t))
        yigin.push({ satir: 0, sutun: t })
      }
    }
    while (yigin.length) {
      const k = yigin.pop()!
      for (const komsu of this.komsular(k.satir, k.sutun)) {
        const i = this.index(komsu.satir, komsu.sutun)
        if (bagli.has(i) || this.izgara[i] === -1) continue
        bagli.add(i)
        yigin.push(komsu)
      }
    }

    const dusen: Hucre[] = []
    for (let s = 0; s < SATIR; s++) {
      for (let t = 0; t < SUTUN; t++) {
        if (this.izgara[this.index(s, t)] !== -1 && !bagli.has(this.index(s, t))) {
          dusen.push({ satir: s, sutun: t })
        }
      }
    }
    return dusen
  }

  /** Balonu ızgaraya oturtur; üç ve fazlası patlar, kopanlar düşer. */
  yerlestir(s: number, t: number, renk: number): PatlamaSonucu {
    if (s < 0 || s >= SATIR || t < 0 || t >= SUTUN || this.dolu(s, t)) {
      return { yerlesti: null, patlayanlar: [], dusenler: [] }
    }
    this.izgara[this.index(s, t)] = renk

    const grup = this.grup(s, t)
    if (grup.length < 3) {
      this.siradaki = this.rastgeleRenk()
      return { yerlesti: { satir: s, sutun: t }, patlayanlar: [], dusenler: [] }
    }

    for (const k of grup) this.izgara[this.index(k.satir, k.sutun)] = -1
    const dusenler = this.dusenleriBul()
    for (const k of dusenler) this.izgara[this.index(k.satir, k.sutun)] = -1

    this.siradaki = this.rastgeleRenk()
    return { yerlesti: { satir: s, sutun: t }, patlayanlar: grup, dusenler }
  }

  get kalanBalon(): number {
    return this.izgara.filter((v) => v !== -1).length
  }

  get temiz(): boolean {
    return this.kalanBalon === 0
  }
}
