/**
 * Domino zinciri bulmacası.
 *
 * Tam bir zincir kurulup taşlar karıştırılarak oyuncuya verilir; yani
 * elindeki bütün taşları yerleştirmek her zaman mümkündür.
 */

import { karistir, type Uretec } from '../../../shared/rastgele.ts'
import { EL_SAYISI, EN_BUYUK } from '../config/constants.ts'

export interface Tas {
  a: number
  b: number
}

export class DominoOyunu {
  zincir: Tas[] = []
  el: Tas[] = []
  secili = -1

  private readonly random: Uretec

  constructor(random: Uretec = Math.random) {
    this.random = random
    this.reset()
  }

  get solUc(): number {
    return this.zincir[0]?.a ?? -1
  }

  get sagUc(): number {
    return this.zincir[this.zincir.length - 1]?.b ?? -1
  }

  get bitti(): boolean {
    return this.el.length === 0
  }

  reset(): void {
    // Rastgele geçerli bir zincir kur
    let deger = Math.floor(this.random() * (EN_BUYUK + 1))
    const tumTaslar: Tas[] = []
    for (let i = 0; i < EL_SAYISI + 1; i++) {
      const sonraki = Math.floor(this.random() * (EN_BUYUK + 1))
      tumTaslar.push({ a: deger, b: sonraki })
      deger = sonraki
    }

    // İlk taş masada başlar, kalanı oyuncunun elinde (karışık ve bazıları ters)
    this.zincir = [tumTaslar[0]]
    this.el = karistir(
      tumTaslar.slice(1).map((t) => (this.random() < 0.5 ? t : { a: t.b, b: t.a })),
      this.random,
    )
    this.secili = -1
  }

  /** Taş hangi uca eklenebilir? */
  uygunUc(tas: Tas): 'sol' | 'sag' | null {
    if (tas.b === this.solUc || tas.a === this.solUc) return 'sol'
    if (tas.a === this.sagUc || tas.b === this.sagUc) return 'sag'
    return null
  }

  sec(index: number): boolean {
    if (this.bitti || index < 0 || index >= this.el.length) return false
    this.secili = this.secili === index ? -1 : index
    return true
  }

  /** Seçili taşı uygun uca ekler. */
  oyna(): 'sol' | 'sag' | null {
    if (this.bitti || this.secili < 0) return null
    const tas = this.el[this.secili]
    const uc = this.uygunUc(tas)
    if (!uc) return null

    if (uc === 'sol') {
      // Sol uca eklerken taşın b'si zincirin a'sına değmeli
      const yerlesecek = tas.b === this.solUc ? tas : { a: tas.b, b: tas.a }
      this.zincir.unshift(yerlesecek)
    } else {
      const yerlesecek = tas.a === this.sagUc ? tas : { a: tas.b, b: tas.a }
      this.zincir.push(yerlesecek)
    }

    this.el.splice(this.secili, 1)
    this.secili = -1
    return uc
  }

  /** Elde oynanabilir taş var mı? */
  get hamleVarMi(): boolean {
    return this.el.some((t) => this.uygunUc(t) !== null)
  }
}
