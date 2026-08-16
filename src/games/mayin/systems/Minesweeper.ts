/**
 * Mayın Tarlası'nın saf mantığı. Phaser'dan bağımsız.
 * Mayınlar ilk açılıştan sonra dağıtılır: ilk tıklama asla mayına gelmez.
 */

import { tamsayi, type Uretec } from '../../../shared/rastgele.ts'

export type Durum = 'hazir' | 'oynaniyor' | 'kazandi' | 'kaybetti'

export interface Hucre {
  mayin: boolean
  acik: boolean
  bayrak: boolean
  /** Komşu mayın sayısı (0-8). */
  komsu: number
}

export interface AcmaSonucu {
  degisti: boolean
  /** Bu hamlede açılan hücreler (animasyon için). */
  acilanlar: number[]
  patladi: boolean
}

const BOS_SONUC: AcmaSonucu = { degisti: false, acilanlar: [], patladi: false }

export class Minesweeper {
  readonly sutun: number
  readonly satir: number
  readonly mayinSayisi: number

  hucreler: Hucre[] = []
  durum: Durum = 'hazir'
  /** Patlayan mayının indeksi (kaybedince). */
  patlayan = -1

  private readonly random: Uretec

  constructor(sutun: number, satir: number, mayinSayisi: number, random: Uretec = Math.random) {
    this.sutun = sutun
    this.satir = satir
    // Mayın sayısı tahtaya sığmalı; ilk tıklamanın çevresi de boş kalabilmeli.
    this.mayinSayisi = Math.min(mayinSayisi, sutun * satir - 9)
    this.random = random
    this.reset()
  }

  get toplam(): number {
    return this.sutun * this.satir
  }

  get bayrakSayisi(): number {
    return this.hucreler.filter((h) => h.bayrak).length
  }

  get kalanMayin(): number {
    return this.mayinSayisi - this.bayrakSayisi
  }

  get bitti(): boolean {
    return this.durum === 'kazandi' || this.durum === 'kaybetti'
  }

  index(satir: number, sutun: number): number {
    return satir * this.sutun + sutun
  }

  konum(index: number): { satir: number; sutun: number } {
    return { satir: Math.floor(index / this.sutun), sutun: index % this.sutun }
  }

  reset(): void {
    this.hucreler = Array.from({ length: this.toplam }, () => ({
      mayin: false,
      acik: false,
      bayrak: false,
      komsu: 0,
    }))
    this.durum = 'hazir'
    this.patlayan = -1
  }

  /** Hücreyi açar; sıfır komşuluysa çevresi de otomatik açılır. */
  ac(index: number): AcmaSonucu {
    if (this.bitti) return BOS_SONUC
    const hucre = this.hucreler[index]
    if (!hucre || hucre.acik || hucre.bayrak) return BOS_SONUC

    if (this.durum === 'hazir') {
      this.mayinlariDagit(index)
      this.durum = 'oynaniyor'
    }

    if (hucre.mayin) {
      hucre.acik = true
      this.patlayan = index
      this.durum = 'kaybetti'
      // Kalan mayınlar da görünsün.
      for (const h of this.hucreler) {
        if (h.mayin) h.acik = true
      }
      return { degisti: true, acilanlar: [index], patladi: true }
    }

    const acilanlar = this.tasmaliAc(index)
    if (this.kazandiMi()) this.durum = 'kazandi'
    return { degisti: acilanlar.length > 0, acilanlar, patladi: false }
  }

  /** Bayrağı takar/çıkarır. */
  bayrakDegistir(index: number): boolean {
    if (this.bitti) return false
    const hucre = this.hucreler[index]
    if (!hucre || hucre.acik) return false
    hucre.bayrak = !hucre.bayrak
    return true
  }

  komsuIndexler(index: number): number[] {
    const { satir, sutun } = this.konum(index)
    const sonuc: number[] = []
    for (let ds = -1; ds <= 1; ds++) {
      for (let dt = -1; dt <= 1; dt++) {
        if (ds === 0 && dt === 0) continue
        const s = satir + ds
        const t = sutun + dt
        if (s < 0 || s >= this.satir || t < 0 || t >= this.sutun) continue
        sonuc.push(this.index(s, t))
      }
    }
    return sonuc
  }

  // --- Yardımcılar ---

  /** İlk açılan hücre ve komşuları mayınsız kalacak şekilde dağıt. */
  private mayinlariDagit(guvenliIndex: number): void {
    const yasak = new Set<number>([guvenliIndex, ...this.komsuIndexler(guvenliIndex)])
    const adaylar: number[] = []
    for (let i = 0; i < this.toplam; i++) {
      if (!yasak.has(i)) adaylar.push(i)
    }

    for (let yerlesen = 0; yerlesen < this.mayinSayisi; yerlesen++) {
      const secim = tamsayi(adaylar.length, this.random)
      const index = adaylar[secim]
      adaylar.splice(secim, 1)
      this.hucreler[index].mayin = true
    }

    for (let i = 0; i < this.toplam; i++) {
      this.hucreler[i].komsu = this.komsuIndexler(i).filter((k) => this.hucreler[k].mayin).length
    }
  }

  /** Sıfır komşulu hücrelerden yayılarak açar (yığın tabanlı taşma doldurma). */
  private tasmaliAc(baslangic: number): number[] {
    const acilanlar: number[] = []
    const yigin = [baslangic]

    while (yigin.length > 0) {
      const index = yigin.pop()!
      const hucre = this.hucreler[index]
      if (hucre.acik || hucre.bayrak || hucre.mayin) continue

      hucre.acik = true
      acilanlar.push(index)
      if (hucre.komsu === 0) yigin.push(...this.komsuIndexler(index))
    }
    return acilanlar
  }

  private kazandiMi(): boolean {
    return this.hucreler.every((h) => h.acik || h.mayin)
  }
}
