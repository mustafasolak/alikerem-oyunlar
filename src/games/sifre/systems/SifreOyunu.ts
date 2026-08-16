/**
 * Şifre Çözme: her harfe bir sayı atanır, oyuncu sayıların hangi harf
 * olduğunu bulur. Birkaç harf ipucu olarak açık verilir.
 */

import { karistir, nTaneSec, type Uretec } from '../../../shared/rastgele.ts'
import { KELIMELER } from '../../../shared/kelimeler.ts'
import { IPUCU_ORANI } from '../config/constants.ts'

export interface Hucre {
  harf: string
  numara: number
  verilen: boolean
  girilen: string | null
}

export class SifreOyunu {
  kelimeler: string[] = []
  hucreler: Hucre[][] = []
  /** harf → numara eşlemesi. */
  sifre = new Map<string, number>()
  hata = 0

  private readonly random: Uretec

  constructor(kelimeSayisi: number, random: Uretec = Math.random) {
    this.random = random
    this.reset(kelimeSayisi)
  }

  get tumHucreler(): Hucre[] {
    return this.hucreler.flat()
  }

  get kalan(): number {
    return this.tumHucreler.filter((h) => !h.verilen && h.girilen !== h.harf).length
  }

  get bitti(): boolean {
    return this.kalan === 0
  }

  reset(kelimeSayisi: number): void {
    const havuz = KELIMELER.map((k) => k.kelime).filter((k) => k.length >= 3 && k.length <= 8)
    this.kelimeler = nTaneSec(havuz, kelimeSayisi, this.random)

    // Kullanılan harflere rastgele numara ver
    const harfler = [...new Set(this.kelimeler.join(''))]
    const numaralar = karistir(
      Array.from({ length: harfler.length }, (_, i) => i + 1),
      this.random,
    )
    this.sifre = new Map(harfler.map((h, i) => [h, numaralar[i]]))

    this.hucreler = this.kelimeler.map((kelime) =>
      [...kelime].map((harf) => ({ harf, numara: this.sifre.get(harf)!, verilen: false, girilen: null })),
    )

    // İpucu olarak bazı harfleri aç
    const acilacak = new Set(
      karistir(harfler, this.random).slice(0, Math.max(1, Math.round(harfler.length * IPUCU_ORANI))),
    )
    for (const satir of this.hucreler) {
      for (const hucre of satir) {
        if (acilacak.has(hucre.harf)) {
          hucre.verilen = true
          hucre.girilen = hucre.harf
        }
      }
    }
    this.hata = 0
  }

  /** Aynı numaraya sahip bütün hücrelere aynı harfi yazar. */
  yaz(numara: number, harf: string | null): 'dogru' | 'yanlis' | 'yok' {
    const hedefler = this.tumHucreler.filter((h) => h.numara === numara && !h.verilen)
    if (this.bitti || hedefler.length === 0) return 'yok'

    for (const h of hedefler) h.girilen = harf
    if (harf === null) return 'yok'

    if (hedefler[0].harf === harf) return 'dogru'
    this.hata++
    return 'yanlis'
  }
}
