/**
 * Nonogram: rastgele bir resim üretilir, kenar ipuçları ondan hesaplanır.
 * Oyuncunun boyaması çözümle birebir aynı olunca bulmaca biter.
 */

import { type Uretec } from '../../../shared/rastgele.ts'

export type HucreDurumu = 'bos' | 'dolu' | 'carpi'

/** Bir satır/sütundaki ardışık dolu grupların uzunlukları. */
export function ipucuCikar(dizi: boolean[]): number[] {
  const sonuc: number[] = []
  let sayac = 0
  for (const dolu of dizi) {
    if (dolu) sayac++
    else if (sayac > 0) {
      sonuc.push(sayac)
      sayac = 0
    }
  }
  if (sayac > 0) sonuc.push(sayac)
  return sonuc.length > 0 ? sonuc : [0]
}

export class Nonogram {
  readonly boyut: number

  cozum: boolean[] = []
  tahta: HucreDurumu[] = []
  satirIpuclari: number[][] = []
  sutunIpuclari: number[][] = []
  hata = 0

  private readonly random: Uretec

  constructor(boyut: number, doluluk: number, random: Uretec = Math.random) {
    this.boyut = boyut
    this.random = random
    this.uret(doluluk)
  }

  get toplam(): number {
    return this.boyut * this.boyut
  }

  index(satir: number, sutun: number): number {
    return satir * this.boyut + sutun
  }

  get kalan(): number {
    let kalan = 0
    for (let i = 0; i < this.toplam; i++) {
      if (this.cozum[i] && this.tahta[i] !== 'dolu') kalan++
    }
    return kalan
  }

  get bitti(): boolean {
    return this.kalan === 0
  }

  uret(doluluk: number): void {
    // Boş satır/sütun kalmasın diye en az bir dolu hücre garantile
    do {
      this.cozum = Array.from({ length: this.toplam }, () => this.random() < doluluk)
    } while (!this.cozum.some(Boolean))

    this.tahta = Array<HucreDurumu>(this.toplam).fill('bos')
    this.hata = 0

    this.satirIpuclari = Array.from({ length: this.boyut }, (_, s) =>
      ipucuCikar(Array.from({ length: this.boyut }, (_, t) => this.cozum[this.index(s, t)])),
    )
    this.sutunIpuclari = Array.from({ length: this.boyut }, (_, t) =>
      ipucuCikar(Array.from({ length: this.boyut }, (_, s) => this.cozum[this.index(s, t)])),
    )
  }

  /** Boyama denemesi. Yanlış kareyi boyamak hata sayılır ve çarpıya döner. */
  boya(index: number): 'dogru' | 'yanlis' | 'yok' {
    if (this.bitti || this.tahta[index] !== 'bos') return 'yok'
    if (this.cozum[index]) {
      this.tahta[index] = 'dolu'
      return 'dogru'
    }
    this.tahta[index] = 'carpi'
    this.hata++
    return 'yanlis'
  }

  /** Çarpı koyma/kaldırma (boş kare işaretleme). */
  isaretle(index: number): boolean {
    if (this.bitti || this.tahta[index] === 'dolu') return false
    this.tahta[index] = this.tahta[index] === 'carpi' ? 'bos' : 'carpi'
    return true
  }
}
