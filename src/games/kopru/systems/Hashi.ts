/**
 * Köprü Kurma (Hashi) mantığı.
 *
 * Bulmaca çözümden geriye üretilir: rastgele adalar birbirine köprülerle
 * bağlanır, sonra köprüler kaldırılıp yalnız ada sayıları bırakılır.
 * Bu yüzden her bulmacanın en az bir çözümü vardır.
 */

import { tamsayi, type Uretec } from '../../../shared/rastgele.ts'

export interface Ada {
  satir: number
  sutun: number
  /** Bu adaya bağlanması gereken köprü sayısı. */
  hedef: number
}

export interface Kopru {
  a: number
  b: number
  /** 1 veya 2 köprü. */
  adet: number
}

export class Hashi {
  readonly boyut: number

  adalar: Ada[] = []
  koprular: Kopru[] = []

  private readonly random: Uretec

  constructor(boyut: number, adaSayisi: number, random: Uretec = Math.random) {
    this.boyut = boyut
    this.random = random
    this.uret(adaSayisi)
  }

  adaBul(satir: number, sutun: number): number {
    return this.adalar.findIndex((a) => a.satir === satir && a.sutun === sutun)
  }

  /** Bir adaya bağlı köprü sayısı. */
  derece(index: number): number {
    return this.koprular
      .filter((k) => k.a === index || k.b === index)
      .reduce((toplam, k) => toplam + k.adet, 0)
  }

  get bitti(): boolean {
    return this.adalar.every((_, i) => this.derece(i) === this.adalar[i].hedef)
  }

  get kalan(): number {
    return this.adalar.filter((_, i) => this.derece(i) !== this.adalar[i].hedef).length
  }

  /** İki ada aynı satır/sütunda ve aralarında ada yoksa bağlanabilir. */
  baglanabilir(a: number, b: number): boolean {
    if (a === b || a < 0 || b < 0) return false
    const A = this.adalar[a]
    const B = this.adalar[b]
    if (A.satir !== B.satir && A.sutun !== B.sutun) return false

    if (A.satir === B.satir) {
      const [min, max] = [Math.min(A.sutun, B.sutun), Math.max(A.sutun, B.sutun)]
      for (let t = min + 1; t < max; t++) if (this.adaBul(A.satir, t) !== -1) return false
    } else {
      const [min, max] = [Math.min(A.satir, B.satir), Math.max(A.satir, B.satir)]
      for (let s = min + 1; s < max; s++) if (this.adaBul(s, A.sutun) !== -1) return false
    }
    // Araya başka bir köprü giriyorsa engel
    return !this.kesisiyorMu(a, b)
  }

  private kesisiyorMu(a: number, b: number): boolean {
    const A = this.adalar[a]
    const B = this.adalar[b]
    const yatay = A.satir === B.satir

    for (const k of this.koprular) {
      const C = this.adalar[k.a]
      const D = this.adalar[k.b]
      const kYatay = C.satir === D.satir
      if (kYatay === yatay) continue

      if (yatay) {
        const s = A.satir
        const [t1, t2] = [Math.min(A.sutun, B.sutun), Math.max(A.sutun, B.sutun)]
        const [s1, s2] = [Math.min(C.satir, D.satir), Math.max(C.satir, D.satir)]
        if (C.sutun > t1 && C.sutun < t2 && s > s1 && s < s2) return true
      } else {
        const t = A.sutun
        const [s1, s2] = [Math.min(A.satir, B.satir), Math.max(A.satir, B.satir)]
        const [t1, t2] = [Math.min(C.sutun, D.sutun), Math.max(C.sutun, D.sutun)]
        if (C.satir > s1 && C.satir < s2 && t > t1 && t < t2) return true
      }
    }
    return false
  }

  /** Dokunma döngüsü: yok → 1 köprü → 2 köprü → yok. */
  koprulesDegistir(a: number, b: number): boolean {
    if (!this.baglanabilir(a, b)) return false
    const mevcut = this.koprular.findIndex(
      (k) => (k.a === a && k.b === b) || (k.a === b && k.b === a),
    )
    if (mevcut === -1) {
      this.koprular.push({ a, b, adet: 1 })
      return true
    }
    if (this.koprular[mevcut].adet === 1) {
      this.koprular[mevcut].adet = 2
      return true
    }
    this.koprular.splice(mevcut, 1)
    return true
  }

  uret(adaSayisi: number): void {
    for (let deneme = 0; deneme < 200; deneme++) {
      this.adalar = []
      this.koprular = []

      // İlk ada
      this.adalar.push({
        satir: tamsayi(this.boyut, this.random),
        sutun: tamsayi(this.boyut, this.random),
        hedef: 0,
      })

      const cozumKoprulari: Kopru[] = []
      let guvenlik = 0
      while (this.adalar.length < adaSayisi && guvenlik++ < 400) {
        const kaynakIndex = tamsayi(this.adalar.length, this.random)
        const kaynak = this.adalar[kaynakIndex]
        const yon = tamsayi(4, this.random)
        const mesafe = 2 + tamsayi(3, this.random)
        const s = kaynak.satir + (yon === 0 ? -mesafe : yon === 2 ? mesafe : 0)
        const t = kaynak.sutun + (yon === 1 ? mesafe : yon === 3 ? -mesafe : 0)
        if (s < 0 || s >= this.boyut || t < 0 || t >= this.boyut) continue
        if (this.adaBul(s, t) !== -1) continue

        // Araya ada girmemeli
        let engel = false
        for (let adim = 1; adim < mesafe; adim++) {
          const ss = kaynak.satir + (yon === 0 ? -adim : yon === 2 ? adim : 0)
          const tt = kaynak.sutun + (yon === 1 ? adim : yon === 3 ? -adim : 0)
          if (this.adaBul(ss, tt) !== -1) engel = true
        }
        if (engel) continue

        this.adalar.push({ satir: s, sutun: t, hedef: 0 })
        const yeniIndex = this.adalar.length - 1
        if (!this.baglanabilir(kaynakIndex, yeniIndex)) {
          this.adalar.pop()
          continue
        }
        const adet = this.random() < 0.35 ? 2 : 1
        cozumKoprulari.push({ a: kaynakIndex, b: yeniIndex, adet })
        this.koprular.push({ a: kaynakIndex, b: yeniIndex, adet })
      }

      if (this.adalar.length < Math.max(4, adaSayisi - 2)) continue

      // Hedef sayıları çözümdeki derecelerden al, sonra köprüleri kaldır
      this.adalar.forEach((ada, i) => {
        ada.hedef = cozumKoprulari
          .filter((k) => k.a === i || k.b === i)
          .reduce((toplam, k) => toplam + k.adet, 0)
      })
      this.adalar = this.adalar.filter((a) => a.hedef > 0)
      this.koprular = []
      if (this.adalar.length >= 4) return
    }
  }
}
