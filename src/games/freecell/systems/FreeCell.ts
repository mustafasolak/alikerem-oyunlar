/**
 * FreeCell mantığı: sekiz sütun, dört boş hücre, dört temel.
 * Tek seferde bir kart taşınır (boş hücre kullanımı oyuncuya bırakılmıştır).
 */

import { RENKLER, desteYap, uzerineKonurMu, type Kart } from '../../../shared/motorlar/Iskambil.ts'
import { type Uretec } from '../../../shared/rastgele.ts'
import { SUTUN_SAYISI } from '../config/constants.ts'

export type YiginTuru = 'sutun' | 'hucre' | 'temel'

export interface Konum {
  tur: YiginTuru
  index: number
}

export class FreeCell {
  sutunlar: Kart[][] = []
  hucreler: (Kart | null)[] = []
  temeller: Kart[][] = []
  hamle = 0

  private readonly random: Uretec

  constructor(random: Uretec = Math.random) {
    this.random = random
    this.dagit()
  }

  get temeldekiKart(): number {
    return this.temeller.reduce((t, x) => t + x.length, 0)
  }

  get bitti(): boolean {
    return this.temeldekiKart === 52
  }

  dagit(): void {
    const kartlar = desteYap(1, RENKLER, this.random).map((k) => ({ ...k, acik: true }))
    this.sutunlar = Array.from({ length: SUTUN_SAYISI }, () => [])
    kartlar.forEach((kart, i) => this.sutunlar[i % SUTUN_SAYISI].push(kart))
    this.hucreler = Array.from({ length: 4 }, () => null)
    this.temeller = Array.from({ length: 4 }, () => [])
    this.hamle = 0
  }

  ustKart(konum: Konum): Kart | null {
    if (konum.tur === 'sutun') return this.sutunlar[konum.index].at(-1) ?? null
    if (konum.tur === 'hucre') return this.hucreler[konum.index]
    return this.temeller[konum.index].at(-1) ?? null
  }

  konabilirMi(kart: Kart, hedef: Konum): boolean {
    if (hedef.tur === 'hucre') return this.hucreler[hedef.index] === null
    if (hedef.tur === 'temel') {
      const temel = this.temeller[hedef.index]
      if (temel.length === 0) return kart.deger === 1
      const ust = temel[temel.length - 1]
      return ust.renk === kart.renk && kart.deger === ust.deger + 1
    }
    const sutun = this.sutunlar[hedef.index]
    if (sutun.length === 0) return true
    return uzerineKonurMu(kart, sutun[sutun.length - 1])
  }

  tasi(kaynak: Konum, hedef: Konum): boolean {
    const kart = this.ustKart(kaynak)
    if (!kart || !this.konabilirMi(kart, hedef)) return false

    if (kaynak.tur === 'sutun') this.sutunlar[kaynak.index].pop()
    else if (kaynak.tur === 'hucre') this.hucreler[kaynak.index] = null
    else this.temeller[kaynak.index].pop()

    if (hedef.tur === 'sutun') this.sutunlar[hedef.index].push(kart)
    else if (hedef.tur === 'hucre') this.hucreler[hedef.index] = kart
    else this.temeller[hedef.index].push(kart)

    this.hamle++
    return true
  }

  /** Kartı uygun temele göndermeyi dener. */
  temeleGonder(kaynak: Konum): boolean {
    for (let i = 0; i < 4; i++) if (this.tasi(kaynak, { tur: 'temel', index: i })) return true
    return false
  }
}
