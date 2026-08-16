/**
 * Lazer/ayna motoru — Laser Reflection ve Aynalarla Lazer bunu kullanır.
 *
 * Işın kaynaktan çıkar, aynalarda 90° kırılır, duvardan yansımaz.
 * Bulmaca çözülmüş hâlden (ışın bütün hedeflerden geçer) üretilir, sonra
 * aynalar rastgele çevrilir; böylece her bulmacanın çözümü vardır.
 */

import { tamsayi, type Uretec } from '../rastgele.ts'

export type Yon = 'ust' | 'sag' | 'alt' | 'sol'
/** '/' ve '\\' biçiminde iki ayna yönü. */
export type AynaYonu = 'egik' | 'ters'

export interface Konum {
  satir: number
  sutun: number
}

const VEKTOR: Record<Yon, Konum> = {
  ust: { satir: -1, sutun: 0 },
  sag: { satir: 0, sutun: 1 },
  alt: { satir: 1, sutun: 0 },
  sol: { satir: 0, sutun: -1 },
}

/** '/' aynasında sağa gelen ışın yukarı gider. */
const EGIK: Record<Yon, Yon> = { sag: 'ust', ust: 'sag', sol: 'alt', alt: 'sol' }
/** '\\' aynasında sağa gelen ışın aşağı gider. */
const TERS: Record<Yon, Yon> = { sag: 'alt', alt: 'sag', sol: 'ust', ust: 'sol' }

export interface Ayna {
  satir: number
  sutun: number
  yon: AynaYonu
}

export class LazerAgi {
  readonly boyut: number

  kaynak: Konum = { satir: 0, sutun: 0 }
  kaynakYon: Yon = 'sag'
  aynalar: Ayna[] = []
  hedefler: Konum[] = []
  hamle = 0

  private readonly random: Uretec

  constructor(boyut: number, aynaSayisi: number, random: Uretec = Math.random) {
    this.boyut = boyut
    this.random = random
    this.uret(aynaSayisi)
  }

  ayna(satir: number, sutun: number): Ayna | undefined {
    return this.aynalar.find((a) => a.satir === satir && a.sutun === sutun)
  }

  /** Işının geçtiği hücreler, sırayla. */
  isinYolu(): Konum[] {
    const yol: Konum[] = []
    let konum = { ...this.kaynak }
    let yon = this.kaynakYon
    const gorulen = new Set<string>()

    for (let adim = 0; adim < this.boyut * this.boyut * 4; adim++) {
      const v = VEKTOR[yon]
      konum = { satir: konum.satir + v.satir, sutun: konum.sutun + v.sutun }
      if (konum.satir < 0 || konum.satir >= this.boyut || konum.sutun < 0 || konum.sutun >= this.boyut) break

      const anahtar = `${konum.satir},${konum.sutun},${yon}`
      if (gorulen.has(anahtar)) break // döngüye girdi
      gorulen.add(anahtar)
      yol.push({ ...konum })

      const a = this.ayna(konum.satir, konum.sutun)
      if (a) yon = a.yon === 'egik' ? EGIK[yon] : TERS[yon]
    }
    return yol
  }

  get vurulanHedefler(): number {
    const yol = new Set(this.isinYolu().map((k) => `${k.satir},${k.sutun}`))
    return this.hedefler.filter((h) => yol.has(`${h.satir},${h.sutun}`)).length
  }

  get bitti(): boolean {
    return this.hedefler.length > 0 && this.vurulanHedefler === this.hedefler.length
  }

  cevir(satir: number, sutun: number): boolean {
    const a = this.ayna(satir, sutun)
    if (!a || this.bitti) return false
    a.yon = a.yon === 'egik' ? 'ters' : 'egik'
    this.hamle++
    return true
  }

  uret(aynaSayisi: number): void {
    for (let deneme = 0; deneme < 300; deneme++) {
      this.kaynak = { satir: tamsayi(this.boyut, this.random), sutun: -1 }
      this.kaynakYon = 'sag'
      this.aynalar = []
      this.hedefler = []

      // Rastgele aynalar serp
      const yerler = new Set<string>()
      for (let i = 0; i < aynaSayisi; i++) {
        const s = tamsayi(this.boyut, this.random)
        const t = tamsayi(this.boyut, this.random)
        const anahtar = `${s},${t}`
        if (yerler.has(anahtar)) continue
        yerler.add(anahtar)
        this.aynalar.push({ satir: s, sutun: t, yon: this.random() < 0.5 ? 'egik' : 'ters' })
      }

      // Bu düzendeki ışın yolundan hedefleri seç
      const yol = this.isinYolu()
      const adaylar = yol.filter((k) => !this.ayna(k.satir, k.sutun))
      if (adaylar.length < 3) continue

      const hedefSayisi = Math.min(3, adaylar.length)
      this.hedefler = []
      for (let i = 0; i < hedefSayisi; i++) {
        const secim = adaylar[Math.floor((adaylar.length / hedefSayisi) * i)]
        if (!this.hedefler.some((h) => h.satir === secim.satir && h.sutun === secim.sutun)) {
          this.hedefler.push({ ...secim })
        }
      }
      if (this.hedefler.length === 0) continue

      // Aynaları karıştır; çözülmüş görünmesin
      for (let karistirma = 0; karistirma < 30; karistirma++) {
        for (const a of this.aynalar) {
          if (this.random() < 0.5) a.yon = a.yon === 'egik' ? 'ters' : 'egik'
        }
        if (!this.bitti) {
          this.hamle = 0
          return
        }
      }
    }
    this.hamle = 0
  }
}
