/**
 * FreeCell mantığı: sekiz sütun, dört boş hücre, dört temel.
 *
 * Çoklu taşıma (süper hamle) desteklenir: sıralı bir dizi, boş hücreler ve boş
 * sütunlar üzerinden tek tek taşınabildiği sürece tek hamlede gider. Taşınabilir
 * en fazla kart: (boş hücre + 1) × 2^(boş sütun).
 */

import { RENKLER, desteYap, uzerineKonurMu, type Kart } from '../../../shared/motorlar/Iskambil.ts'
import { GeriAlmaYigini } from '../../../shared/motorlar/GeriAlma.ts'
import { type Uretec } from '../../../shared/rastgele.ts'
import { SUTUN_SAYISI } from '../config/constants.ts'

export type YiginTuru = 'sutun' | 'hucre' | 'temel'

export interface Konum {
  tur: YiginTuru
  index: number
}

/** Geri alma için saklanan tam durum. */
interface Durum {
  sutunlar: Kart[][]
  hucreler: (Kart | null)[]
  temeller: Kart[][]
  hamle: number
}

export class FreeCell {
  sutunlar: Kart[][] = []
  hucreler: (Kart | null)[] = []
  temeller: Kart[][] = []
  hamle = 0

  private readonly random: Uretec
  private readonly gecmis = new GeriAlmaYigini<Durum>()

  constructor(random: Uretec = Math.random) {
    this.random = random
    this.dagit()
  }

  get geriAlinabilir(): boolean {
    return this.gecmis.doluMu
  }

  private kaydet(): void {
    this.gecmis.kaydet({
      sutunlar: this.sutunlar,
      hucreler: this.hucreler,
      temeller: this.temeller,
      hamle: this.hamle,
    })
  }

  /** Son hamleyi geri alır; geri alma da bir hamle sayılır. */
  geriAl(): boolean {
    const onceki = this.gecmis.al()
    if (!onceki) return false
    this.sutunlar = onceki.sutunlar
    this.hucreler = onceki.hucreler
    this.temeller = onceki.temeller
    this.hamle = onceki.hamle + 1
    return true
  }

  get bosHucre(): number {
    return this.hucreler.filter((h) => h === null).length
  }

  get bosSutun(): number {
    return this.sutunlar.filter((s) => s.length === 0).length
  }

  /**
   * Tek hamlede taşınabilecek en fazla kart.
   * Hedef boş bir sütunsa o sütun ara durak olarak kullanılamaz.
   */
  tasimaKapasitesi(hedefBosSutunMu = false): number {
    const sutun = Math.max(0, this.bosSutun - (hedefBosSutunMu ? 1 : 0))
    return (this.bosHucre + 1) * 2 ** sutun
  }

  /**
   * Sütunun `kartIndex`ten sonu kadarı sıralı bir dizi mi?
   * (bir küçük ve ters renk — sütunda taşınabilir olması için gerekli)
   */
  siraliMi(sutunIndex: number, kartIndex: number): boolean {
    const sutun = this.sutunlar[sutunIndex]
    if (kartIndex < 0 || kartIndex >= sutun.length) return false
    for (let i = kartIndex; i < sutun.length - 1; i++) {
      if (!uzerineKonurMu(sutun[i + 1], sutun[i])) return false
    }
    return true
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
    this.gecmis.temizle()
  }

  ustKart(konum: Konum): Kart | null {
    if (konum.tur === 'sutun') return this.sutunlar[konum.index].at(-1) ?? null
    if (konum.tur === 'hucre') return this.hucreler[konum.index]
    return this.temeller[konum.index].at(-1) ?? null
  }

  /** Kaynaktan alınabilecek kart dizisi (tek kart ya da sıralı grup). */
  alinacak(kaynak: Konum, kartIndex?: number): Kart[] | null {
    if (kaynak.tur !== 'sutun') {
      const kart = this.ustKart(kaynak)
      return kart ? [kart] : null
    }
    const sutun = this.sutunlar[kaynak.index]
    if (sutun.length === 0) return null
    const bas = kartIndex ?? sutun.length - 1
    if (!this.siraliMi(kaynak.index, bas)) return null
    return sutun.slice(bas)
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

  tasi(kaynak: Konum, hedef: Konum, kartIndex?: number): boolean {
    if (kaynak.tur === hedef.tur && kaynak.index === hedef.index) return false

    const kartlar = this.alinacak(kaynak, kartIndex)
    if (!kartlar || kartlar.length === 0) return false
    if (!this.konabilirMi(kartlar[0], hedef)) return false

    // Hücre ve temele tek kart girer
    if (kartlar.length > 1 && hedef.tur !== 'sutun') return false

    if (kartlar.length > 1) {
      const hedefBos = hedef.tur === 'sutun' && this.sutunlar[hedef.index].length === 0
      if (kartlar.length > this.tasimaKapasitesi(hedefBos)) return false
    }

    this.kaydet()

    if (kaynak.tur === 'sutun') this.sutunlar[kaynak.index].splice(this.sutunlar[kaynak.index].length - kartlar.length)
    else if (kaynak.tur === 'hucre') this.hucreler[kaynak.index] = null
    else this.temeller[kaynak.index].pop()

    if (hedef.tur === 'sutun') this.sutunlar[hedef.index].push(...kartlar)
    else if (hedef.tur === 'hucre') this.hucreler[hedef.index] = kartlar[0]
    else this.temeller[hedef.index].push(...kartlar)

    this.hamle++
    return true
  }

  /** Kartı uygun temele göndermeyi dener. */
  temeleGonder(kaynak: Konum): boolean {
    for (let i = 0; i < 4; i++) if (this.tasi(kaynak, { tur: 'temel', index: i })) return true
    return false
  }
}
