/** Eşleştirme mantığı: sol ve sağ sütun, doğru ikilileri bulma. */

import { karistir, nTaneSec, type Uretec } from '../../../shared/rastgele.ts'
import { IKILILER } from '../config/constants.ts'

export interface Secenek {
  id: number
  yazi: string
  eslesti: boolean
}

export class Eslestirme {
  sol: Secenek[] = []
  sag: Secenek[] = []
  seciliSol: number | null = null
  hata = 0

  private readonly random: Uretec

  constructor(ciftSayisi: number, random: Uretec = Math.random) {
    this.random = random
    this.dagit(ciftSayisi)
  }

  get kalan(): number {
    return this.sol.filter((s) => !s.eslesti).length
  }

  get bitti(): boolean {
    return this.kalan === 0
  }

  dagit(ciftSayisi: number): void {
    const secilen = nTaneSec(IKILILER, ciftSayisi, this.random)
    this.sol = karistir(
      secilen.map(([a], i) => ({ id: i, yazi: a, eslesti: false })),
      this.random,
    )
    this.sag = karistir(
      secilen.map(([, b], i) => ({ id: i, yazi: b, eslesti: false })),
      this.random,
    )
    this.seciliSol = null
    this.hata = 0
  }

  solSec(sira: number): boolean {
    const secenek = this.sol[sira]
    if (this.bitti || !secenek || secenek.eslesti) return false
    this.seciliSol = this.seciliSol === sira ? null : sira
    return true
  }

  /** Sağdan seçim: doğruysa çift eşleşir, yanlışsa hata sayılır. */
  sagSec(sira: number): 'dogru' | 'yanlis' | 'yok' {
    if (this.bitti || this.seciliSol === null) return 'yok'
    const sagSecenek = this.sag[sira]
    if (!sagSecenek || sagSecenek.eslesti) return 'yok'

    const solSecenek = this.sol[this.seciliSol]
    if (solSecenek.id === sagSecenek.id) {
      solSecenek.eslesti = true
      sagSecenek.eslesti = true
      this.seciliSol = null
      return 'dogru'
    }
    this.hata++
    this.seciliSol = null
    return 'yanlis'
  }
}
