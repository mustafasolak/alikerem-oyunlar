/**
 * Hedefe ulaşma bulmacası: verilen sayılardan ikisi bir işlemle birleştirilir,
 * sonuç yeni sayı olur. Hedef, üretim sırasında aynı adımlar uygulanarak
 * bulunduğu için bulmaca her zaman çözülebilir.
 */

import { birSec, tamsayi, type Uretec } from '../../../shared/rastgele.ts'
import { ISLEMLER } from '../config/constants.ts'

export type Islem = (typeof ISLEMLER)[number]

export function uygula(a: number, b: number, islem: Islem): number | null {
  if (islem === '+') return a + b
  if (islem === '-') return a - b > 0 ? a - b : null
  if (islem === '×') return a * b
  // Bölme yalnız tam bölünüyorsa geçerli
  return b !== 0 && a % b === 0 ? a / b : null
}

export class MatematikOyunu {
  sayilar: number[] = []
  hedef = 0
  hamle = 0
  seciliSayilar: number[] = []
  seciliIslem: Islem | null = null

  private baslangic: number[] = []
  private readonly random: Uretec

  constructor(sayiAdedi: number, enBuyuk: number, adim: number, random: Uretec = Math.random) {
    this.random = random
    this.uret(sayiAdedi, enBuyuk, adim)
  }

  get bitti(): boolean {
    return this.sayilar.length === 1 && this.sayilar[0] === this.hedef
  }

  get kaybetti(): boolean {
    return this.sayilar.length === 1 && this.sayilar[0] !== this.hedef
  }

  uret(sayiAdedi: number, enBuyuk: number, adim: number): void {
    for (let deneme = 0; deneme < 200; deneme++) {
      const havuz = Array.from({ length: sayiAdedi }, () => 1 + tamsayi(enBuyuk, this.random))
      const calisma = havuz.slice()

      // Rastgele geçerli adımlar uygulayarak bir hedef üret
      for (let i = 0; i < adim && calisma.length > 1; i++) {
        const a = tamsayi(calisma.length, this.random)
        let b = tamsayi(calisma.length, this.random)
        if (b === a) b = (b + 1) % calisma.length
        const sonuc = uygula(calisma[a], calisma[b], birSec(ISLEMLER, this.random))
        if (sonuc === null || sonuc > 999) continue
        const kalan = calisma.filter((_, i2) => i2 !== a && i2 !== b)
        kalan.push(sonuc)
        calisma.length = 0
        calisma.push(...kalan)
      }

      if (calisma.length === 1 && calisma[0] > 1 && calisma[0] !== havuz[0]) {
        this.baslangic = havuz
        this.sayilar = havuz.slice()
        this.hedef = calisma[0]
        this.hamle = 0
        this.seciliSayilar = []
        this.seciliIslem = null
        return
      }
    }
    // Yedek: basit toplam hedefi
    this.baslangic = Array.from({ length: sayiAdedi }, () => 1 + tamsayi(enBuyuk, this.random))
    this.sayilar = this.baslangic.slice()
    this.hedef = this.baslangic.reduce((a, b) => a + b, 0)
    this.hamle = 0
    this.seciliSayilar = []
    this.seciliIslem = null
  }

  bastanBasla(): void {
    this.sayilar = this.baslangic.slice()
    this.hamle = 0
    this.seciliSayilar = []
    this.seciliIslem = null
  }

  sayiSec(index: number): void {
    if (this.bitti) return
    const yer = this.seciliSayilar.indexOf(index)
    if (yer >= 0) this.seciliSayilar.splice(yer, 1)
    else if (this.seciliSayilar.length < 2) this.seciliSayilar.push(index)
    this.dene()
  }

  islemSec(islem: Islem): void {
    if (this.bitti) return
    this.seciliIslem = this.seciliIslem === islem ? null : islem
    this.dene()
  }

  /** İki sayı ve bir işlem seçiliyse hamleyi uygular. */
  private dene(): boolean {
    if (this.seciliSayilar.length !== 2 || !this.seciliIslem) return false
    const [a, b] = this.seciliSayilar
    const sonuc = uygula(this.sayilar[a], this.sayilar[b], this.seciliIslem)
    if (sonuc === null) return false

    const kalan = this.sayilar.filter((_, i) => i !== a && i !== b)
    kalan.push(sonuc)
    this.sayilar = kalan
    this.hamle++
    this.seciliSayilar = []
    this.seciliIslem = null
    return true
  }
}
