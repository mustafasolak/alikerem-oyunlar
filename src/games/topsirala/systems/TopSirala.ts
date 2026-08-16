/**
 * Renk ayırma mantığı: her tüp bir yığın, üstteki top alınıp başka tüpe konur.
 * Bulmaca, çözülmüş hâlden geçerli hamlelerle geriye gidilerek karıştırılır;
 * böylece her dağılım çözülebilir kalır.
 */

import { tamsayi, type Uretec } from '../../../shared/rastgele.ts'

export class TopSirala {
  readonly renkSayisi: number
  readonly kapasite: number
  readonly tupSayisi: number

  /** tupler[i] = alttan üste renk numaraları. */
  tupler: number[][] = []
  hamle = 0
  secili: number | null = null

  private readonly random: Uretec

  constructor(renkSayisi: number, kapasite: number, bosTup: number, random: Uretec = Math.random) {
    this.renkSayisi = renkSayisi
    this.kapasite = kapasite
    this.tupSayisi = renkSayisi + bosTup
    this.random = random
    this.reset()
  }

  ust(tup: number): number | null {
    const yigin = this.tupler[tup]
    if (!yigin || yigin.length === 0) return null
    return yigin[yigin.length - 1]
  }

  /** Bütün tüpler ya boş ya da tek renkle tam dolu mu? */
  get bitti(): boolean {
    return this.tupler.every((t) => t.length === 0 || (t.length === this.kapasite && t.every((r) => r === t[0])))
  }

  reset(): void {
    // Çözülmüş hâl
    this.tupler = Array.from({ length: this.tupSayisi }, (_, i) =>
      i < this.renkSayisi ? Array<number>(this.kapasite).fill(i) : [],
    )
    this.hamle = 0
    this.secili = null

    // Geçerli hamlelerle karıştır; bitmiş görünmesin
    do {
      for (let i = 0; i < this.renkSayisi * this.kapasite * 12; i++) {
        const kaynaklar = this.tupler.map((_, i2) => i2).filter((i2) => this.tupler[i2].length > 0)
        const kaynak = kaynaklar[tamsayi(kaynaklar.length, this.random)]
        const hedefler = this.tupler
          .map((_, i2) => i2)
          .filter((i2) => i2 !== kaynak && this.tupler[i2].length < this.kapasite)
        if (hedefler.length === 0) continue
        const hedef = hedefler[tamsayi(hedefler.length, this.random)]
        this.tupler[hedef].push(this.tupler[kaynak].pop()!)
      }
    } while (this.bitti)
  }

  private gecerliTup(index: number): boolean {
    return index >= 0 && index < this.tupSayisi
  }

  /** Kaynaktan hedefe konabilir mi? */
  gecerliMi(kaynak: number, hedef: number): boolean {
    if (!this.gecerliTup(kaynak) || !this.gecerliTup(hedef)) return false
    if (kaynak === hedef) return false
    const top = this.ust(kaynak)
    if (top === null) return false
    if (this.tupler[hedef].length >= this.kapasite) return false
    const ustteki = this.ust(hedef)
    return ustteki === null || ustteki === top
  }

  /** Tüpe dokunma: ilk dokunuş topu alır, ikincisi bırakır. */
  dokun(tup: number): 'secildi' | 'birakildi' | 'iptal' | 'yok' {
    if (this.bitti || !this.gecerliTup(tup)) return 'yok'

    if (this.secili === null) {
      if (this.ust(tup) === null) return 'yok'
      this.secili = tup
      return 'secildi'
    }
    if (this.secili === tup) {
      this.secili = null
      return 'iptal'
    }
    if (!this.gecerliMi(this.secili, tup)) return 'yok'

    this.tupler[tup].push(this.tupler[this.secili].pop()!)
    this.secili = null
    this.hamle++
    return 'birakildi'
  }
}
