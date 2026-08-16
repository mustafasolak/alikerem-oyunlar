/**
 * Adam Asmaca'nın saf mantığı. Phaser'dan bağımsız.
 * Harf karşılaştırmaları Türkçe büyük harfe göre yapılır (I/İ ayrımı korunur).
 */

import { birSec, type Uretec } from '../../../shared/rastgele.ts'
import { kelimeleriSec, type KelimeKaydi } from '../../../shared/kelimeler.ts'
import { MAX_CAN, MAX_KELIME, MIN_KELIME } from '../config/constants.ts'

export type Durum = 'oynaniyor' | 'kazandi' | 'kaybetti'

export interface TahminSonucu {
  gecerli: boolean
  dogru: boolean
  durum: Durum
}

export const buyuk = (harf: string): string => harf.toLocaleUpperCase('tr')

export class HangmanGame {
  kayit!: KelimeKaydi
  durum: Durum = 'oynaniyor'
  /** Denenmiş harfler (büyük). */
  readonly denenen = new Set<string>()
  yanlis = 0

  private readonly random: Uretec

  constructor(random: Uretec = Math.random) {
    this.random = random
    this.reset()
  }

  get kelime(): string {
    return this.kayit.kelime
  }

  get kalanCan(): number {
    return MAX_CAN - this.yanlis
  }

  get bitti(): boolean {
    return this.durum !== 'oynaniyor'
  }

  /** Kelimenin harfleri; bilinmeyenler null. */
  get maske(): (string | null)[] {
    return [...this.kelime].map((harf) => (this.denenen.has(harf) ? harf : null))
  }

  reset(): void {
    const havuz = kelimeleriSec(MIN_KELIME, MAX_KELIME)
    this.kayit = birSec(havuz, this.random)
    this.denenen.clear()
    this.yanlis = 0
    this.durum = 'oynaniyor'
  }

  tahmin(harfGirdi: string): TahminSonucu {
    const harf = buyuk(harfGirdi)
    if (this.bitti || harf.length !== 1 || this.denenen.has(harf)) {
      return { gecerli: false, dogru: false, durum: this.durum }
    }

    this.denenen.add(harf)
    const dogru = this.kelime.includes(harf)
    if (!dogru) this.yanlis++

    if (this.maske.every((h) => h !== null)) this.durum = 'kazandi'
    else if (this.yanlis >= MAX_CAN) this.durum = 'kaybetti'

    return { gecerli: true, dogru, durum: this.durum }
  }

  /** Kelimede geçen ama henüz denenmemiş harf var mı? (ipucu vermek için değil, test için) */
  harfVarMi(harf: string): boolean {
    return this.kelime.includes(buyuk(harf))
  }
}
