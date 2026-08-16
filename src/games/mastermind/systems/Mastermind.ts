/**
 * Mastermind mantığı: gizli renk dizisi ve tahmin değerlendirme.
 * "tam" = doğru renk doğru yerde, "yakin" = renk var ama yeri yanlış.
 */

import { tamsayi, type Uretec } from '../../../shared/rastgele.ts'
import { MAX_DENEME, RENK_SAYISI, UZUNLUK } from '../config/constants.ts'

export interface Geribildirim {
  tam: number
  yakin: number
}

export interface Satir {
  tahmin: number[]
  sonuc: Geribildirim
}

export type Durum = 'oynaniyor' | 'kazandi' | 'kaybetti'

/** Klasik değerlendirme: önce tam eşleşmeler, kalanlarda renk sayımı. */
export function degerlendir(gizli: number[], tahmin: number[]): Geribildirim {
  let tam = 0
  const gizliKalan: number[] = []
  const tahminKalan: number[] = []

  for (let i = 0; i < gizli.length; i++) {
    if (gizli[i] === tahmin[i]) tam++
    else {
      gizliKalan.push(gizli[i])
      tahminKalan.push(tahmin[i])
    }
  }

  let yakin = 0
  for (const renk of tahminKalan) {
    const yer = gizliKalan.indexOf(renk)
    if (yer !== -1) {
      gizliKalan.splice(yer, 1)
      yakin++
    }
  }
  return { tam, yakin }
}

export class Mastermind {
  gizli: number[] = []
  satirlar: Satir[] = []
  durum: Durum = 'oynaniyor'

  private readonly random: Uretec

  constructor(random: Uretec = Math.random) {
    this.random = random
    this.reset()
  }

  get kalanHak(): number {
    return MAX_DENEME - this.satirlar.length
  }

  get denemeSayisi(): number {
    return this.satirlar.length
  }

  get bitti(): boolean {
    return this.durum !== 'oynaniyor'
  }

  reset(): void {
    this.gizli = Array.from({ length: UZUNLUK }, () => tamsayi(RENK_SAYISI, this.random))
    this.satirlar = []
    this.durum = 'oynaniyor'
  }

  /** Tahmini işler. Eksik tahmin kabul edilmez. */
  dene(tahmin: number[]): Satir | null {
    if (this.bitti || tahmin.length !== UZUNLUK || tahmin.some((r) => r < 0)) return null

    const sonuc = degerlendir(this.gizli, tahmin)
    const satir: Satir = { tahmin: tahmin.slice(), sonuc }
    this.satirlar.push(satir)

    if (sonuc.tam === UZUNLUK) this.durum = 'kazandi'
    else if (this.satirlar.length >= MAX_DENEME) this.durum = 'kaybetti'
    return satir
  }
}
