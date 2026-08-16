/**
 * 15'li kaydırmalı puzzle'ın saf mantığı. Phaser'dan bağımsız.
 * Taşlar tek boyutlu dizide tutulur; 0 boşluğu temsil eder.
 */

import { tamsayi, type Uretec } from '../../../shared/rastgele.ts'
import { GRID_SIZE, SHUFFLE_MOVES } from '../config/constants.ts'

export type Yon = 'up' | 'down' | 'left' | 'right'

export interface Konum {
  row: number
  col: number
}

/** Boşluğun hangi yöne gideceği (oyuncunun bastığı ok tuşunun tersi mantığı). */
const YON_VEKTOR: Record<Yon, Konum> = {
  up: { row: -1, col: 0 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
  right: { row: 0, col: 1 },
}

export class SlidingPuzzle {
  readonly size: number

  /** tiles[index] = taş numarası, 0 = boşluk. */
  tiles: number[] = []
  hamle = 0
  cozuldu = false

  private readonly random: Uretec

  constructor(size: number = GRID_SIZE, random: Uretec = Math.random) {
    this.size = size
    this.random = random
    this.reset()
  }

  get toplamHucre(): number {
    return this.size * this.size
  }

  get bosIndex(): number {
    return this.tiles.indexOf(0)
  }

  konum(index: number): Konum {
    return { row: Math.floor(index / this.size), col: index % this.size }
  }

  index(row: number, col: number): number {
    return row * this.size + col
  }

  /** Sıralı diziye döner, sonra geçerli hamlelerle karıştırır. */
  reset(): void {
    this.tiles = Array.from({ length: this.toplamHucre }, (_, i) => (i + 1) % this.toplamHucre)
    this.hamle = 0
    this.cozuldu = false
    this.karistir()
  }

  /** Sıralı hâlden rastgele geçerli hamlelerle uzaklaş: her zaman çözülebilir kalır. */
  private karistir(): void {
    let sonBos = -1
    for (let i = 0; i < SHUFFLE_MOVES; i++) {
      const komsular = this.oynanabilirIndexler().filter((index) => index !== sonBos)
      const secilen = komsular[tamsayi(komsular.length, this.random)]
      sonBos = this.bosIndex
      this.takasla(secilen)
    }
    // Çok küçük ihtimalle sıralı kalırsa bir hamle daha at.
    if (this.kontrolCozuldu()) {
      this.takasla(this.oynanabilirIndexler()[0])
    }
  }

  /** Boşluğun yanındaki, oynanabilir taşların indeksleri. */
  oynanabilirIndexler(): number[] {
    const { row, col } = this.konum(this.bosIndex)
    const adaylar: Konum[] = [
      { row: row - 1, col },
      { row: row + 1, col },
      { row, col: col - 1 },
      { row, col: col + 1 },
    ]
    return adaylar
      .filter((k) => k.row >= 0 && k.row < this.size && k.col >= 0 && k.col < this.size)
      .map((k) => this.index(k.row, k.col))
  }

  oynanabilir(index: number): boolean {
    return this.oynanabilirIndexler().includes(index)
  }

  /** Verilen hücredeki taşı boşluğa kaydırır. Başarılıysa true. */
  oyna(index: number): boolean {
    if (this.cozuldu || !this.oynanabilir(index)) return false
    this.takasla(index)
    this.hamle++
    this.cozuldu = this.kontrolCozuldu()
    return true
  }

  /**
   * Ok tuşu ile oynama: yön, taşın hareket edeceği yönü belirtir.
   * Örnek: 'left' → boşluğun sağındaki taş sola kayar.
   */
  yonleOyna(yon: Yon): boolean {
    const vektor = YON_VEKTOR[yon]
    const bos = this.konum(this.bosIndex)
    // Taş, boşluğun ters yönündeki komşudur.
    const kaynak = { row: bos.row - vektor.row, col: bos.col - vektor.col }
    if (kaynak.row < 0 || kaynak.row >= this.size || kaynak.col < 0 || kaynak.col >= this.size) return false
    return this.oyna(this.index(kaynak.row, kaynak.col))
  }

  /** Taş kendi doğru yerinde mi? (görsel ipucu için) */
  yerindeMi(index: number): boolean {
    const value = this.tiles[index]
    return value !== 0 && value === index + 1
  }

  private takasla(index: number): void {
    const bos = this.bosIndex
    ;[this.tiles[bos], this.tiles[index]] = [this.tiles[index], this.tiles[bos]]
  }

  private kontrolCozuldu(): boolean {
    return this.tiles.every((value, index) => value === (index + 1) % this.toplamHucre)
  }
}
