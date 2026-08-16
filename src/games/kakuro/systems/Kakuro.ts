/**
 * Kakuro. Bulmaca çözümden üretilir:
 * önce rakamlar yerleştirilir (her dizide tekrar yok), sonra dizi toplamları
 * ipucu olarak yazılır. Bu yüzden her bulmacanın çözümü vardır.
 */

import { karistir, type Uretec } from '../../../shared/rastgele.ts'

export type HucreTuru = 'blok' | 'dolu'

export interface Hucre {
  tur: HucreTuru
  /** Çözümdeki değer (dolu hücreler için). */
  deger: number
  girilen: number | null
  /** Blok hücrede: sağa doğru dizinin toplamı. */
  sagToplam: number
  /** Blok hücrede: aşağı doğru dizinin toplamı. */
  altToplam: number
}

export class Kakuro {
  readonly boyut: number

  hucreler: Hucre[] = []
  hata = 0

  private readonly random: Uretec

  constructor(boyut: number, random: Uretec = Math.random) {
    this.boyut = boyut
    this.random = random
    this.uret()
  }

  index(s: number, t: number): number {
    return s * this.boyut + t
  }

  hucre(s: number, t: number): Hucre | undefined {
    if (s < 0 || s >= this.boyut || t < 0 || t >= this.boyut) return undefined
    return this.hucreler[this.index(s, t)]
  }

  get kalan(): number {
    return this.hucreler.filter((h) => h.tur === 'dolu' && h.girilen !== h.deger).length
  }

  get bitti(): boolean {
    return this.kalan === 0
  }

  uret(): void {
    for (let deneme = 0; deneme < 200; deneme++) {
      // İlk satır ve sütun blok; kalan alan dolu hücre
      const hucreler: Hucre[] = Array.from({ length: this.boyut * this.boyut }, (_, i) => {
        const s = Math.floor(i / this.boyut)
        const t = i % this.boyut
        const blok = s === 0 || t === 0
        return { tur: blok ? 'blok' : 'dolu', deger: 0, girilen: null, sagToplam: 0, altToplam: 0 }
      })
      this.hucreler = hucreler

      // Satır satır, tekrarsız rakamlarla doldur (sütun tekrarını da gözet)
      let basarili = true
      for (let s = 1; s < this.boyut && basarili; s++) {
        const uzunluk = this.boyut - 1
        let yerlesti = false
        for (let d = 0; d < 60 && !yerlesti; d++) {
          const aday = karistir([1, 2, 3, 4, 5, 6, 7, 8, 9], this.random).slice(0, uzunluk)
          const cakisma = aday.some((deger, i) => {
            const t = i + 1
            for (let us = 1; us < s; us++) if (this.hucre(us, t)!.deger === deger) return true
            return false
          })
          if (cakisma) continue
          aday.forEach((deger, i) => (this.hucre(s, i + 1)!.deger = deger))
          yerlesti = true
        }
        if (!yerlesti) basarili = false
      }
      if (!basarili) continue

      // İpuçları: sol bloktan sağa toplam, üst bloktan aşağı toplam
      for (let s = 1; s < this.boyut; s++) {
        let toplam = 0
        for (let t = 1; t < this.boyut; t++) toplam += this.hucre(s, t)!.deger
        this.hucre(s, 0)!.sagToplam = toplam
      }
      for (let t = 1; t < this.boyut; t++) {
        let toplam = 0
        for (let s = 1; s < this.boyut; s++) toplam += this.hucre(s, t)!.deger
        this.hucre(0, t)!.altToplam = toplam
      }

      this.hata = 0
      return
    }
  }

  yaz(index: number, deger: number | null): 'dogru' | 'yanlis' | 'yok' {
    const hucre = this.hucreler[index]
    if (this.bitti || !hucre || hucre.tur !== 'dolu') return 'yok'
    hucre.girilen = deger
    if (deger === null) return 'yok'
    if (deger === hucre.deger) return 'dogru'
    this.hata++
    return 'yanlis'
  }
}
