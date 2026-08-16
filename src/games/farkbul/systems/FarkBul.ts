/**
 * Farkları Bul: iki desen üretilir, ikincisinde birkaç hücre değiştirilir.
 * Görsel dosya yok; desen renk ve şekil dizisi olarak tutulur.
 */

import { karistir, tamsayi, type Uretec } from '../../../shared/rastgele.ts'
import { FARK_SAYISI, SATIR, SEKIL_RENKLERI, SUTUN } from '../config/constants.ts'

export type SekilTuru = 'daire' | 'kare' | 'ucgen'

export interface Sekil {
  renk: number
  tur: SekilTuru
}

const TURLER: SekilTuru[] = ['daire', 'kare', 'ucgen']

export class FarkBul {
  ust: Sekil[] = []
  alt: Sekil[] = []
  farklar: number[] = []
  bulunanlar = new Set<number>()

  private readonly random: Uretec

  constructor(random: Uretec = Math.random) {
    this.random = random
    this.reset()
  }

  get toplam(): number {
    return SUTUN * SATIR
  }

  get kalan(): number {
    return this.farklar.length - this.bulunanlar.size
  }

  get bitti(): boolean {
    return this.kalan === 0
  }

  reset(): void {
    this.ust = Array.from({ length: this.toplam }, () => ({
      renk: SEKIL_RENKLERI[tamsayi(SEKIL_RENKLERI.length, this.random)],
      tur: TURLER[tamsayi(TURLER.length, this.random)],
    }))
    this.alt = this.ust.map((s) => ({ ...s }))

    this.farklar = karistir(
      Array.from({ length: this.toplam }, (_, i) => i),
      this.random,
    ).slice(0, FARK_SAYISI)

    for (const i of this.farklar) {
      // Rengi ya da şekli değiştir — ikisi de gözle ayırt edilebilir
      if (this.random() < 0.5) {
        let renk = SEKIL_RENKLERI[tamsayi(SEKIL_RENKLERI.length, this.random)]
        let guvenlik = 0
        while (renk === this.ust[i].renk && guvenlik++ < 10) {
          renk = SEKIL_RENKLERI[tamsayi(SEKIL_RENKLERI.length, this.random)]
        }
        this.alt[i] = { ...this.alt[i], renk }
      } else {
        const kalanTurler = TURLER.filter((t) => t !== this.ust[i].tur)
        this.alt[i] = { ...this.alt[i], tur: kalanTurler[tamsayi(kalanTurler.length, this.random)] }
      }
    }
    this.bulunanlar.clear()
  }

  /** Hücreye dokunma: fark varsa işaretlenir. */
  dokun(index: number): 'dogru' | 'yanlis' {
    if (this.farklar.includes(index) && !this.bulunanlar.has(index)) {
      this.bulunanlar.add(index)
      return 'dogru'
    }
    return 'yanlis'
  }
}
