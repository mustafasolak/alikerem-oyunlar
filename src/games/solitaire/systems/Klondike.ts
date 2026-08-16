/**
 * Klondike Solitaire mantığı.
 * Yedi sütun, dört temel, bir çekme destesi ve açılan kart yığını.
 */

import {
  RENKLER,
  desteYap,
  uzerineKonurMu,
  type Kart,
  type Renk,
} from '../../../shared/motorlar/Iskambil.ts'
import { type Uretec } from '../../../shared/rastgele.ts'
import { SUTUN_SAYISI } from '../config/constants.ts'

export type YiginTuru = 'sutun' | 'temel' | 'acik' | 'deste'

export interface Konum {
  tur: YiginTuru
  index: number
}

export class Klondike {
  sutunlar: Kart[][] = []
  temeller: Kart[][] = []
  deste: Kart[] = []
  acik: Kart[] = []
  hamle = 0

  private readonly random: Uretec

  constructor(random: Uretec = Math.random) {
    this.random = random
    this.dagit()
  }

  get temeldekiKart(): number {
    return this.temeller.reduce((toplam, t) => toplam + t.length, 0)
  }

  get bitti(): boolean {
    return this.temeldekiKart === 52
  }

  dagit(): void {
    const kartlar = desteYap(1, RENKLER, this.random)
    this.sutunlar = Array.from({ length: SUTUN_SAYISI }, () => [])
    this.temeller = Array.from({ length: 4 }, () => [])

    let sira = 0
    for (let s = 0; s < SUTUN_SAYISI; s++) {
      for (let k = 0; k <= s; k++) {
        const kart = kartlar[sira++]
        kart.acik = k === s
        this.sutunlar[s].push(kart)
      }
    }
    this.deste = kartlar.slice(sira)
    this.acik = []
    this.hamle = 0
  }

  /** Desteden kart çevirir; deste bitmişse açılanları geri koyar. */
  desteyiCevir(): boolean {
    if (this.deste.length === 0) {
      if (this.acik.length === 0) return false
      this.deste = this.acik.reverse().map((k) => ({ ...k, acik: false }))
      this.acik = []
      this.hamle++
      return true
    }
    const kart = this.deste.pop()!
    kart.acik = true
    this.acik.push(kart)
    this.hamle++
    return true
  }

  /** Konumdaki (taşınabilir) kart dizisi. */
  alinacak(konum: Konum, kartIndex: number): Kart[] | null {
    if (konum.tur === 'sutun') {
      const sutun = this.sutunlar[konum.index]
      if (kartIndex < 0 || kartIndex >= sutun.length || !sutun[kartIndex].acik) return null
      return sutun.slice(kartIndex)
    }
    if (konum.tur === 'acik') {
      return this.acik.length > 0 ? [this.acik[this.acik.length - 1]] : null
    }
    if (konum.tur === 'temel') {
      const temel = this.temeller[konum.index]
      return temel.length > 0 ? [temel[temel.length - 1]] : null
    }
    return null
  }

  /** Kart dizisi hedefe konabilir mi? */
  konabilirMi(kartlar: Kart[], hedef: Konum): boolean {
    if (kartlar.length === 0) return false
    const ilk = kartlar[0]

    if (hedef.tur === 'temel') {
      if (kartlar.length !== 1) return false
      const temel = this.temeller[hedef.index]
      if (temel.length === 0) return ilk.deger === 1
      const ust = temel[temel.length - 1]
      return ust.renk === ilk.renk && ilk.deger === ust.deger + 1
    }

    if (hedef.tur === 'sutun') {
      const sutun = this.sutunlar[hedef.index]
      if (sutun.length === 0) return ilk.deger === 13
      const ust = sutun[sutun.length - 1]
      return ust.acik && uzerineKonurMu(ilk, ust)
    }
    return false
  }

  tasi(kaynak: Konum, kartIndex: number, hedef: Konum): boolean {
    const kartlar = this.alinacak(kaynak, kartIndex)
    if (!kartlar || !this.konabilirMi(kartlar, hedef)) return false

    // Kaynaktan çıkar
    if (kaynak.tur === 'sutun') this.sutunlar[kaynak.index].splice(kartIndex)
    else if (kaynak.tur === 'acik') this.acik.pop()
    else if (kaynak.tur === 'temel') this.temeller[kaynak.index].pop()

    if (hedef.tur === 'sutun') this.sutunlar[hedef.index].push(...kartlar)
    else this.temeller[hedef.index].push(...kartlar)

    // Kaynak sütunun yeni üst kartını aç
    if (kaynak.tur === 'sutun') {
      const sutun = this.sutunlar[kaynak.index]
      if (sutun.length > 0) sutun[sutun.length - 1].acik = true
    }

    this.hamle++
    return true
  }

  /** Kartı uygun temele göndermeyi dener (çift dokunma kolaylığı). */
  temeleGonder(kaynak: Konum, kartIndex: number): boolean {
    for (let i = 0; i < 4; i++) {
      if (this.tasi(kaynak, kartIndex, { tur: 'temel', index: i })) return true
    }
    return false
  }

  temelRengi(index: number): Renk | null {
    const temel = this.temeller[index]
    return temel.length > 0 ? temel[0].renk : null
  }
}
