/**
 * Zuma: toplar sabit bir yol boyunca ilerler. Atılan top zincire girer,
 * üç ve fazlası aynı renk patlar; patlamadan sonra komşular birleşirse
 * zincirleme devam eder.
 */

import { tamsayi, type Uretec } from '../../../shared/rastgele.ts'
import { MAX_ZINCIR, RENK_SAYISI } from '../config/constants.ts'

export interface PatlamaSonucu {
  patlayan: number
  zincirleme: number
}

export class ZumaZinciri {
  /** Baştan sona renk dizisi; 0. eleman yolun en ilerisi. */
  toplar: number[] = []
  siradaki = 0
  patlatilan = 0

  private readonly random: Uretec

  constructor(baslangic: number, random: Uretec = Math.random) {
    this.random = random
    this.reset(baslangic)
  }

  get uzunluk(): number {
    return this.toplar.length
  }

  get kaybetti(): boolean {
    return this.toplar.length >= MAX_ZINCIR
  }

  get bitti(): boolean {
    return this.toplar.length === 0
  }

  reset(baslangic: number): void {
    this.toplar = Array.from({ length: baslangic }, () => tamsayi(RENK_SAYISI, this.random))
    this.siradaki = this.rastgeleRenk()
    this.patlatilan = 0
  }

  rastgeleRenk(): number {
    const mevcut = [...new Set(this.toplar)]
    if (mevcut.length === 0) return tamsayi(RENK_SAYISI, this.random)
    return mevcut[tamsayi(mevcut.length, this.random)]
  }

  /** Zincirin sonuna yeni top ekleyerek ilerlet. */
  ilerlet(): void {
    if (this.bitti) return
    this.toplar.push(tamsayi(RENK_SAYISI, this.random))
  }

  /** Topu verilen konuma sokar ve patlamaları çözer. */
  ekle(konum: number, renk: number): PatlamaSonucu {
    const yer = Math.max(0, Math.min(this.toplar.length, konum))
    this.toplar.splice(yer, 0, renk)

    let patlayan = 0
    let zincirleme = 0
    let bakilacak = yer

    for (;;) {
      const grup = this.grupSinirlari(bakilacak)
      if (!grup) break
      patlayan += grup.son - grup.bas + 1
      zincirleme++
      this.toplar.splice(grup.bas, grup.son - grup.bas + 1)
      // Patlamadan sonra birleşen komşular yeniden bakılır
      bakilacak = Math.max(0, grup.bas - 1)
      if (bakilacak >= this.toplar.length) break
    }

    this.patlatilan += patlayan
    this.siradaki = this.rastgeleRenk()
    return { patlayan, zincirleme }
  }

  /** Verilen indeksteki topun aynı renkli komşularıyla oluşturduğu grup (3+ ise). */
  private grupSinirlari(index: number): { bas: number; son: number } | null {
    if (index < 0 || index >= this.toplar.length) return null
    const renk = this.toplar[index]
    let bas = index
    let son = index
    while (bas > 0 && this.toplar[bas - 1] === renk) bas--
    while (son < this.toplar.length - 1 && this.toplar[son + 1] === renk) son++
    return son - bas + 1 >= 3 ? { bas, son } : null
  }
}
