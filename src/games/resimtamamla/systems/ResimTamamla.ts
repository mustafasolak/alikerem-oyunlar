/**
 * Resim Tamamlama: simetrik bir desen üretilir, 2×2'lik bir parçası çıkarılır.
 * Doğru parça, birkaç yanlış seçenekle birlikte sunulur.
 */

import { karistir, tamsayi, type Uretec } from '../../../shared/rastgele.ts'
import { BOYUT, DESEN_RENKLERI, SECENEK_SAYISI } from '../config/constants.ts'

/** 2×2 parça: dört renk. */
export type Parca = [number, number, number, number]

export class ResimTamamla {
  desen: number[] = []
  /** Çıkarılan parçanın sol üst köşesi. */
  eksikSatir = 0
  eksikSutun = 0
  secenekler: Parca[] = []
  dogruSecenek = 0
  hata = 0

  private readonly random: Uretec

  constructor(random: Uretec = Math.random) {
    this.random = random
    this.yeniTur()
  }

  index(s: number, t: number): number {
    return s * BOYUT + t
  }

  eksikMi(s: number, t: number): boolean {
    return s >= this.eksikSatir && s < this.eksikSatir + 2 && t >= this.eksikSutun && t < this.eksikSutun + 2
  }

  yeniTur(): void {
    // Soldan sağa aynalı desen: göz için düzenli görünsün
    const yari = Math.ceil(BOYUT / 2)
    this.desen = Array<number>(BOYUT * BOYUT).fill(0)
    for (let s = 0; s < BOYUT; s++) {
      for (let t = 0; t < yari; t++) {
        const renk = DESEN_RENKLERI[tamsayi(DESEN_RENKLERI.length, this.random)]
        this.desen[this.index(s, t)] = renk
        this.desen[this.index(s, BOYUT - 1 - t)] = renk
      }
    }

    this.eksikSatir = tamsayi(BOYUT - 1, this.random)
    this.eksikSutun = tamsayi(BOYUT - 1, this.random)

    const dogru: Parca = [
      this.desen[this.index(this.eksikSatir, this.eksikSutun)],
      this.desen[this.index(this.eksikSatir, this.eksikSutun + 1)],
      this.desen[this.index(this.eksikSatir + 1, this.eksikSutun)],
      this.desen[this.index(this.eksikSatir + 1, this.eksikSutun + 1)],
    ]

    const yanlislar: Parca[] = []
    let guvenlik = 0
    while (yanlislar.length < SECENEK_SAYISI - 1 && guvenlik++ < 200) {
      const aday: Parca = [...dogru]
      // Bir ya da iki hücreyi değiştir
      const degisecek = 1 + tamsayi(2, this.random)
      for (let i = 0; i < degisecek; i++) {
        const yer = tamsayi(4, this.random)
        let renk = DESEN_RENKLERI[tamsayi(DESEN_RENKLERI.length, this.random)]
        let g2 = 0
        while (renk === aday[yer] && g2++ < 10) renk = DESEN_RENKLERI[tamsayi(DESEN_RENKLERI.length, this.random)]
        aday[yer] = renk
      }
      const ayni = (a: Parca, b: Parca): boolean => a.every((v, i) => v === b[i])
      if (ayni(aday, dogru) || yanlislar.some((y) => ayni(y, aday))) continue
      yanlislar.push(aday)
    }

    const hepsi = karistir([dogru, ...yanlislar], this.random)
    this.secenekler = hepsi
    this.dogruSecenek = hepsi.findIndex((p) => p.every((v, i) => v === dogru[i]))
  }

  sec(index: number): boolean {
    if (index === this.dogruSecenek) return true
    this.hata++
    return false
  }
}
