/**
 * Gizli Nesne: rastgele simgeler serpilir, birkaçı "aranan" seçilir.
 * Aranan her simgeden tahtada tam bir tane bulunur.
 */

import { karistir, nTaneSec, tamsayi, type Uretec } from '../../../shared/rastgele.ts'
import { ARANAN_SAYISI, NESNE_SAYISI, SIMGELER } from '../config/constants.ts'

export interface Nesne {
  simge: string
  x: number
  y: number
  bulundu: boolean
}

export class GizliNesne {
  nesneler: Nesne[] = []
  arananlar: string[] = []
  hata = 0

  private readonly random: Uretec

  constructor(genislik: number, yukseklik: number, kenar: number, random: Uretec = Math.random) {
    this.random = random
    this.reset(genislik, yukseklik, kenar)
  }

  get kalan(): number {
    return this.arananlar.filter((s) => !this.bulunduMu(s)).length
  }

  get bitti(): boolean {
    return this.kalan === 0
  }

  bulunduMu(simge: string): boolean {
    return this.nesneler.some((n) => n.simge === simge && n.bulundu)
  }

  reset(genislik: number, yukseklik: number, kenar: number): void {
    this.arananlar = nTaneSec(SIMGELER, ARANAN_SAYISI, this.random)
    const dolgu = SIMGELER.filter((s) => !this.arananlar.includes(s))

    // Aranan simgelerden tam birer tane, kalanı dolgu
    const havuz = [
      ...this.arananlar,
      ...Array.from({ length: NESNE_SAYISI - ARANAN_SAYISI }, () => dolgu[tamsayi(dolgu.length, this.random)]),
    ]

    this.nesneler = karistir(havuz, this.random).map((simge) => ({
      simge,
      x: kenar + this.random() * (genislik - kenar * 2),
      y: kenar + this.random() * (yukseklik - kenar * 2),
      bulundu: false,
    }))
    this.hata = 0
  }

  /** En yakın nesneyi dener. */
  dokun(x: number, y: number, yaricap: number): 'dogru' | 'yanlis' {
    let enYakin = -1
    let enKisa = yaricap
    this.nesneler.forEach((n, i) => {
      if (n.bulundu) return
      const d = Math.hypot(n.x - x, n.y - y)
      if (d < enKisa) {
        enKisa = d
        enYakin = i
      }
    })

    if (enYakin >= 0 && this.arananlar.includes(this.nesneler[enYakin].simge)) {
      this.nesneler[enYakin].bulundu = true
      return 'dogru'
    }
    this.hata++
    return 'yanlis'
  }
}
