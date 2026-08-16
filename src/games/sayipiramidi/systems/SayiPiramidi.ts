/**
 * Sayı Piramidi: en alt sıra rastgele üretilir, üst sıralar altındaki
 * iki taşın toplamıdır. Bazı taşlar gizlenip oyuncuya doldurtulur.
 *
 * Taşlar tek dizide tutulur; 0. kat en üstteki tek taştır.
 */

import { karistir, tamsayi, type Uretec } from '../../../shared/rastgele.ts'

export interface Tas {
  kat: number
  sira: number
  deger: number
  gizli: boolean
  girilen: number | null
}

export class SayiPiramidi {
  readonly kat: number

  taslar: Tas[] = []
  hata = 0

  private readonly random: Uretec

  constructor(kat: number, gizliSayisi: number, enBuyukTaban: number, random: Uretec = Math.random) {
    this.kat = kat
    this.random = random
    this.uret(gizliSayisi, enBuyukTaban)
  }

  index(kat: number, sira: number): number {
    // 0. katta 1 taş, 1. katta 2 taş... k. kattan önce k*(k+1)/2 taş var
    return (kat * (kat + 1)) / 2 + sira
  }

  tas(kat: number, sira: number): Tas {
    return this.taslar[this.index(kat, sira)]
  }

  get kalan(): number {
    return this.taslar.filter((t) => t.gizli && t.girilen !== t.deger).length
  }

  get bitti(): boolean {
    return this.kalan === 0
  }

  uret(gizliSayisi: number, enBuyukTaban: number): void {
    const altSira = Array.from({ length: this.kat }, () => 1 + tamsayi(enBuyukTaban, this.random))
    const katlar: number[][] = [altSira]

    // Aşağıdan yukarı topla
    for (let k = this.kat - 1; k >= 1; k--) {
      const alt = katlar[0]
      katlar.unshift(Array.from({ length: k }, (_, i) => alt[i] + alt[i + 1]))
    }

    this.taslar = []
    katlar.forEach((sira, kat) => {
      sira.forEach((deger, i) => {
        this.taslar.push({ kat, sira: i, deger, gizli: false, girilen: null })
      })
    })

    // En üstteki taş hep açık kalsın, ipucu olsun
    const adaylar = karistir(
      this.taslar.map((_, i) => i).filter((i) => i !== 0),
      this.random,
    ).slice(0, gizliSayisi)
    for (const i of adaylar) {
      this.taslar[i].gizli = true
      this.taslar[i].girilen = null
    }
    this.hata = 0
  }

  /** Gizli taşa değer yazar. Yanlışsa hata sayılır ama değer yine görünür. */
  yaz(index: number, deger: number | null): 'dogru' | 'yanlis' | 'yok' {
    const tas = this.taslar[index]
    if (this.bitti || !tas || !tas.gizli) return 'yok'
    tas.girilen = deger
    if (deger === null) return 'yok'
    if (deger === tas.deger) return 'dogru'
    this.hata++
    return 'yanlis'
  }
}
