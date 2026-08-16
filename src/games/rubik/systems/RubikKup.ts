/**
 * 3×3 Rubik küpü.
 *
 * Altı yüz, her yüzde dokuz sticker. Yüz indeksleri:
 * 0=U (üst), 1=D (alt), 2=L (sol), 3=R (sağ), 4=F (ön), 5=B (arka).
 * Karıştırma geçerli hamlelerle yapıldığı için küp her zaman çözülebilir.
 */

import { tamsayi, type Uretec } from '../../../shared/rastgele.ts'

export const U = 0
export const D = 1
export const L = 2
export const R = 3
export const F = 4
export const B = 5

export type Hamle = 'U' | "U'" | 'D' | "D'" | 'L' | "L'" | 'R' | "R'" | 'F' | "F'" | 'B' | "B'"
export const HAMLELER: Hamle[] = ['U', "U'", 'D', "D'", 'L', "L'", 'R', "R'", 'F', "F'", 'B', "B'"]

/** Bir yüzü saat yönünde çevirir. */
function yuzuCevir(yuz: number[]): number[] {
  return [yuz[6], yuz[3], yuz[0], yuz[7], yuz[4], yuz[1], yuz[8], yuz[5], yuz[2]]
}

/**
 * Her temel hamle için: çevrilen yüz ve kenar şeridi döngüsü.
 * Şerit: [yüz, [3 sticker indeksi]] dörtlüsü, sırayla birbirine taşınır.
 */
const KENARLAR: Record<string, [number, number[]][]> = {
  U: [
    [B, [2, 1, 0]],
    [R, [2, 1, 0]],
    [F, [2, 1, 0]],
    [L, [2, 1, 0]],
  ],
  D: [
    [F, [6, 7, 8]],
    [R, [6, 7, 8]],
    [B, [6, 7, 8]],
    [L, [6, 7, 8]],
  ],
  L: [
    [U, [0, 3, 6]],
    [F, [0, 3, 6]],
    [D, [0, 3, 6]],
    [B, [8, 5, 2]],
  ],
  R: [
    [U, [8, 5, 2]],
    [B, [0, 3, 6]],
    [D, [8, 5, 2]],
    [F, [8, 5, 2]],
  ],
  F: [
    [U, [6, 7, 8]],
    [R, [0, 3, 6]],
    [D, [2, 1, 0]],
    [L, [8, 5, 2]],
  ],
  B: [
    [U, [2, 1, 0]],
    [L, [0, 3, 6]],
    [D, [6, 7, 8]],
    [R, [8, 5, 2]],
  ],
}

const YUZ_INDEKSI: Record<string, number> = { U, D, L, R, F, B }

export class RubikKup {
  /** yuzler[yuz][sticker] = renk numarası. */
  yuzler: number[][] = []
  hamle = 0

  private readonly random: Uretec

  constructor(random: Uretec = Math.random) {
    this.random = random
    this.sifirla()
  }

  sifirla(): void {
    this.yuzler = Array.from({ length: 6 }, (_, y) => Array<number>(9).fill(y))
    this.hamle = 0
  }

  get cozuldu(): boolean {
    return this.yuzler.every((yuz) => yuz.every((renk) => renk === yuz[0]))
  }

  get dogruYuz(): number {
    return this.yuzler.filter((yuz) => yuz.every((renk) => renk === yuz[0])).length
  }

  /** Hamleyi uygular ('X' saat yönü, "X'" ters). */
  uygula(hamle: Hamle, sayilsin = true): void {
    const ters = hamle.endsWith("'")
    const harf = hamle[0]
    const kere = ters ? 3 : 1
    for (let i = 0; i < kere; i++) this.temelHamle(harf)
    if (sayilsin) this.hamle++
  }

  private temelHamle(harf: string): void {
    const yuzIndex = YUZ_INDEKSI[harf]
    this.yuzler[yuzIndex] = yuzuCevir(this.yuzler[yuzIndex])

    const serit = KENARLAR[harf]
    const alinan = serit.map(([yuz, indeksler]) => indeksler.map((i) => this.yuzler[yuz][i]))
    // Şeritler bir sonrakine kayar
    for (let i = 0; i < serit.length; i++) {
      const [yuz, indeksler] = serit[(i + 1) % serit.length]
      indeksler.forEach((hedef, j) => {
        this.yuzler[yuz][hedef] = alinan[i][j]
      })
    }
  }

  karistir(adet: number): void {
    this.sifirla()
    let sonHarf = ''
    for (let i = 0; i < adet; i++) {
      let hamle = HAMLELER[tamsayi(HAMLELER.length, this.random)]
      // Aynı yüzü peş peşe çevirmek karışıklığı azaltır
      let guvenlik = 0
      while (hamle[0] === sonHarf && guvenlik++ < 10) {
        hamle = HAMLELER[tamsayi(HAMLELER.length, this.random)]
      }
      sonHarf = hamle[0]
      this.uygula(hamle, false)
    }
    // Şansa çözülmüş kaldıysa bir hamle daha
    if (this.cozuldu) this.uygula('R', false)
    this.hamle = 0
  }
}
