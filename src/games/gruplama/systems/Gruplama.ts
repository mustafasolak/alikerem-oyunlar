/**
 * Connections tarzı gruplama: on altı kelime, dört gizli grup.
 * Oyuncu dört kelime seçip dener; hepsi aynı gruptansa grup çözülür.
 */

import { karistir, nTaneSec, type Uretec } from '../../../shared/rastgele.ts'
import { GRUPLAR, GRUP_BOYU, GRUP_SAYISI, MAX_HATA, type GrupTanimi } from '../config/constants.ts'

export interface Kart {
  kelime: string
  grup: number
  cozuldu: boolean
}

export type DenemeSonucu = 'dogru' | 'yanlis' | 'eksik'

export class Gruplama {
  kartlar: Kart[] = []
  gruplar: GrupTanimi[] = []
  secili = new Set<number>()
  cozulen: number[] = []
  hata = 0

  private readonly random: Uretec

  constructor(random: Uretec = Math.random) {
    this.random = random
    this.reset()
  }

  get kalanGrup(): number {
    return GRUP_SAYISI - this.cozulen.length
  }

  get bitti(): boolean {
    return this.kalanGrup === 0
  }

  get kaybetti(): boolean {
    return this.hata >= MAX_HATA && !this.bitti
  }

  reset(): void {
    this.gruplar = nTaneSec(GRUPLAR, GRUP_SAYISI, this.random)
    this.kartlar = karistir(
      this.gruplar.flatMap((g, i) => g.kelimeler.map((kelime) => ({ kelime, grup: i, cozuldu: false }))),
      this.random,
    )
    this.secili.clear()
    this.cozulen = []
    this.hata = 0
  }

  sec(index: number): boolean {
    const kart = this.kartlar[index]
    if (this.bitti || !kart || kart.cozuldu) return false
    if (this.secili.has(index)) this.secili.delete(index)
    else if (this.secili.size < GRUP_BOYU) this.secili.add(index)
    else return false
    return true
  }

  dene(): DenemeSonucu {
    if (this.secili.size !== GRUP_BOYU) return 'eksik'
    const secilenler = [...this.secili].map((i) => this.kartlar[i])
    const grup = secilenler[0].grup

    if (secilenler.every((k) => k.grup === grup)) {
      for (const k of secilenler) k.cozuldu = true
      this.cozulen.push(grup)
      this.secili.clear()
      return 'dogru'
    }

    this.hata++
    this.secili.clear()
    return 'yanlis'
  }
}
