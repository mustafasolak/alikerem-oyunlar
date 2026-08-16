/**
 * Rush Hour mantığı. Her araç kendi ekseninde kayar; kırmızı araç sağ kenardan
 * çıkınca bölüm biter.
 */

import { BOYUT, CIKIS_SATIR } from '../config/constants.ts'

export interface Arac {
  satir: number
  sutun: number
  uzunluk: number
  yatay: boolean
}

export class RushHour {
  araclar: Arac[] = []
  hamle = 0

  constructor(bolum: [number, number, number, boolean][]) {
    this.yukle(bolum)
  }

  yukle(bolum: [number, number, number, boolean][]): void {
    this.araclar = bolum.map(([satir, sutun, uzunluk, yatay]) => ({ satir, sutun, uzunluk, yatay }))
    this.hamle = 0
  }

  /** Bölüm verisi tutarlı mı? (araçlar tahtada ve çakışmasız) */
  gecerliMi(): boolean {
    const dolu = new Set<string>()
    for (const arac of this.araclar) {
      for (const h of this.hucreler(arac)) {
        if (h.satir < 0 || h.satir >= BOYUT || h.sutun < 0 || h.sutun >= BOYUT) return false
        const anahtar = `${h.satir},${h.sutun}`
        if (dolu.has(anahtar)) return false
        dolu.add(anahtar)
      }
    }
    return true
  }

  /** Aracın kapladığı hücreler. */
  hucreler(arac: Arac): { satir: number; sutun: number }[] {
    return Array.from({ length: arac.uzunluk }, (_, i) => ({
      satir: arac.satir + (arac.yatay ? 0 : i),
      sutun: arac.sutun + (arac.yatay ? i : 0),
    }))
  }

  /** Hücre doluysa aracın indeksi, boşsa -1. */
  hucredekiArac(satir: number, sutun: number): number {
    return this.araclar.findIndex((a) => this.hucreler(a).some((h) => h.satir === satir && h.sutun === sutun))
  }

  get bitti(): boolean {
    const hedef = this.araclar[0]
    return hedef.sutun + hedef.uzunluk >= BOYUT && hedef.satir === CIKIS_SATIR
  }

  /** Aracı yönünde `adim` kadar kaydırır (±1). */
  kaydir(index: number, adim: number): boolean {
    if (this.bitti) return false
    const arac = this.araclar[index]
    if (!arac) return false

    const yeni: Arac = {
      ...arac,
      satir: arac.yatay ? arac.satir : arac.satir + adim,
      sutun: arac.yatay ? arac.sutun + adim : arac.sutun,
    }

    // Kırmızı araç çıkışa doğru tahtayı terk edebilir
    const cikisaGidiyor = index === 0 && arac.yatay && arac.satir === CIKIS_SATIR && adim > 0
    for (const h of this.hucreler(yeni)) {
      if (h.satir < 0 || h.satir >= BOYUT || h.sutun < 0) return false
      if (h.sutun >= BOYUT) {
        if (!cikisaGidiyor) return false
        continue
      }
      const dolu = this.hucredekiArac(h.satir, h.sutun)
      if (dolu !== -1 && dolu !== index) return false
    }

    this.araclar[index] = yeni
    this.hamle++
    return true
  }
}
