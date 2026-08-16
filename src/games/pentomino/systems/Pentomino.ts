/**
 * Pentomino: kutu, rastgele parçalara bölünerek üretilir; parçalar döndürülüp
 * karıştırılır. Bu yüzden her bulmacanın çözümü vardır.
 */

import { karistir, tamsayi, type Uretec } from '../../../shared/rastgele.ts'

export type Hucre = [number, number]

export interface Parca {
  hucreler: Hucre[]
  renk: number
  yerlesti: boolean
}

/** Parçayı saat yönünde çevirir ve sol üste yaslar. */
export function cevir(hucreler: Hucre[]): Hucre[] {
  const donmus: Hucre[] = hucreler.map(([s, t]) => [t, -s])
  const enAzS = Math.min(...donmus.map(([s]) => s))
  const enAzT = Math.min(...donmus.map(([, t]) => t))
  return donmus.map(([s, t]) => [s - enAzS, t - enAzT] as Hucre)
}

export class Pentomino {
  readonly sutun: number
  readonly satir: number

  tahta: number[] = []
  parcalar: Parca[] = []

  private readonly random: Uretec

  constructor(sutun: number, satir: number, parcaSayisi: number, renkler: number[], random: Uretec = Math.random) {
    this.sutun = sutun
    this.satir = satir
    this.random = random
    this.uret(parcaSayisi, renkler)
  }

  index(s: number, t: number): number {
    return s * this.sutun + t
  }

  get kalanParca(): number {
    return this.parcalar.filter((p) => !p.yerlesti).length
  }

  get bitti(): boolean {
    return this.tahta.every((v) => v !== -1)
  }

  /** Kutuyu bitişik parçalara böl. */
  uret(parcaSayisi: number, renkler: number[]): void {
    const toplam = this.sutun * this.satir
    const atama = Array<number>(toplam).fill(-1)

    // Tohumlar
    const tohumlar = karistir(
      Array.from({ length: toplam }, (_, i) => i),
      this.random,
    ).slice(0, parcaSayisi)
    tohumlar.forEach((i, p) => (atama[i] = p))

    // Kalan hücreleri komşu parçalara kat
    let kalan = toplam - parcaSayisi
    let guvenlik = 0
    while (kalan > 0 && guvenlik++ < toplam * 50) {
      const i = tamsayi(toplam, this.random)
      if (atama[i] !== -1) continue
      const s = Math.floor(i / this.sutun)
      const t = i % this.sutun
      const komsular = [
        [s - 1, t],
        [s + 1, t],
        [s, t - 1],
        [s, t + 1],
      ].filter(([ks, kt]) => ks >= 0 && ks < this.satir && kt >= 0 && kt < this.sutun)
      const dolular = komsular.map(([ks, kt]) => atama[this.index(ks, kt)]).filter((p) => p !== -1)
      if (dolular.length === 0) continue
      atama[i] = dolular[tamsayi(dolular.length, this.random)]
      kalan--
    }
    // Kalan boşlukları ilk parçaya ver
    for (let i = 0; i < toplam; i++) if (atama[i] === -1) atama[i] = 0

    this.parcalar = Array.from({ length: parcaSayisi }, (_, p) => {
      const hucreler: Hucre[] = []
      for (let i = 0; i < toplam; i++) {
        if (atama[i] === p) hucreler.push([Math.floor(i / this.sutun), i % this.sutun])
      }
      const enAzS = Math.min(...hucreler.map(([s]) => s))
      const enAzT = Math.min(...hucreler.map(([, t]) => t))
      let normal = hucreler.map(([s, t]) => [s - enAzS, t - enAzT] as Hucre)
      // Rastgele döndür
      const kere = tamsayi(4, this.random)
      for (let d = 0; d < kere; d++) normal = cevir(normal)
      return { hucreler: normal, renk: renkler[p % renkler.length], yerlesti: false }
    }).filter((p) => p.hucreler.length > 0)

    this.parcalar = karistir(this.parcalar, this.random)
    this.tahta = Array<number>(toplam).fill(-1)
  }

  sigar(parca: Parca, satir: number, sutun: number): boolean {
    return parca.hucreler.every(([ds, dt]) => {
      const s = satir + ds
      const t = sutun + dt
      return s >= 0 && s < this.satir && t >= 0 && t < this.sutun && this.tahta[this.index(s, t)] === -1
    })
  }

  koy(parcaIndex: number, satir: number, sutun: number): boolean {
    const parca = this.parcalar[parcaIndex]
    if (!parca || parca.yerlesti || !this.sigar(parca, satir, sutun)) return false
    for (const [ds, dt] of parca.hucreler) this.tahta[this.index(satir + ds, sutun + dt)] = parca.renk
    parca.yerlesti = true
    return true
  }

  dondur(parcaIndex: number): boolean {
    const parca = this.parcalar[parcaIndex]
    if (!parca || parca.yerlesti) return false
    parca.hucreler = cevir(parca.hucreler)
    return true
  }
}
