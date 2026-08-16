/**
 * Labirent üretimi ve gezinme.
 * Üretim: geri izlemeli derinlik-öncelikli arama — her hücreye tek yol çıkar,
 * yani labirent "mükemmel"dir (döngüsüz, her yere ulaşılır).
 */

import { karistir, type Uretec } from '../../../shared/rastgele.ts'

export type Yon = 'up' | 'down' | 'left' | 'right'

export interface Konum {
  satir: number
  sutun: number
}

export interface Duvarlar {
  ust: boolean
  alt: boolean
  sol: boolean
  sag: boolean
}

const VEKTOR: Record<Yon, Konum> = {
  up: { satir: -1, sutun: 0 },
  down: { satir: 1, sutun: 0 },
  left: { satir: 0, sutun: -1 },
  right: { satir: 0, sutun: 1 },
}

const KARSI: Record<Yon, Yon> = { up: 'down', down: 'up', left: 'right', right: 'left' }

export class Labirent {
  readonly boyut: number

  hucreler: Duvarlar[] = []
  oyuncu: Konum = { satir: 0, sutun: 0 }
  cikis: Konum = { satir: 0, sutun: 0 }
  hamle = 0
  /** Gezilen hücreler (iz bırakmak için). */
  readonly iz = new Set<string>()

  private readonly random: Uretec

  constructor(boyut: number, random: Uretec = Math.random) {
    this.boyut = boyut
    this.random = random
    this.uret()
  }

  index(satir: number, sutun: number): number {
    return satir * this.boyut + sutun
  }

  duvar(satir: number, sutun: number): Duvarlar {
    return this.hucreler[this.index(satir, sutun)]
  }

  get bitti(): boolean {
    return this.oyuncu.satir === this.cikis.satir && this.oyuncu.sutun === this.cikis.sutun
  }

  uret(): void {
    const toplam = this.boyut * this.boyut
    this.hucreler = Array.from({ length: toplam }, () => ({ ust: true, alt: true, sol: true, sag: true }))
    const ziyaret = new Set<number>()
    const yigin: Konum[] = [{ satir: 0, sutun: 0 }]
    ziyaret.add(0)

    while (yigin.length > 0) {
      const su = yigin[yigin.length - 1]
      const komsular = karistir(['up', 'down', 'left', 'right'] as Yon[], this.random)
        .map((yon) => ({ yon, hedef: { satir: su.satir + VEKTOR[yon].satir, sutun: su.sutun + VEKTOR[yon].sutun } }))
        .filter(
          ({ hedef }) =>
            hedef.satir >= 0 &&
            hedef.satir < this.boyut &&
            hedef.sutun >= 0 &&
            hedef.sutun < this.boyut &&
            !ziyaret.has(this.index(hedef.satir, hedef.sutun)),
        )

      if (komsular.length === 0) {
        yigin.pop()
        continue
      }

      const { yon, hedef } = komsular[0]
      this.duvarKaldir(su, yon)
      this.duvarKaldir(hedef, KARSI[yon])
      ziyaret.add(this.index(hedef.satir, hedef.sutun))
      yigin.push(hedef)
    }

    this.oyuncu = { satir: 0, sutun: 0 }
    this.cikis = { satir: this.boyut - 1, sutun: this.boyut - 1 }
    this.hamle = 0
    this.iz.clear()
    this.iz.add('0,0')
  }

  /** Verilen yöne gidilebiliyorsa oyuncuyu taşır. */
  git(yon: Yon): boolean {
    if (this.bitti) return false
    const duvarlar = this.duvar(this.oyuncu.satir, this.oyuncu.sutun)
    const acik =
      (yon === 'up' && !duvarlar.ust) ||
      (yon === 'down' && !duvarlar.alt) ||
      (yon === 'left' && !duvarlar.sol) ||
      (yon === 'right' && !duvarlar.sag)
    if (!acik) return false

    this.oyuncu = {
      satir: this.oyuncu.satir + VEKTOR[yon].satir,
      sutun: this.oyuncu.sutun + VEKTOR[yon].sutun,
    }
    this.hamle++
    this.iz.add(`${this.oyuncu.satir},${this.oyuncu.sutun}`)
    return true
  }

  private duvarKaldir(konum: Konum, yon: Yon): void {
    const hucre = this.duvar(konum.satir, konum.sutun)
    if (yon === 'up') hucre.ust = false
    else if (yon === 'down') hucre.alt = false
    else if (yon === 'left') hucre.sol = false
    else hucre.sag = false
  }
}
