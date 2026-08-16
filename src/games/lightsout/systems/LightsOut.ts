/**
 * Lights Out mantığı. Bir kareye basmak kendisini ve dört komşusunu değiştirir.
 *
 * Bulmaca, sönük tahtadan başlayıp rastgele basışlar uygulanarak üretilir;
 * böylece her zaman çözülebilir olur (basışlar kendi tersidir).
 */

import { tamsayi, type Uretec } from '../../../shared/rastgele.ts'

export class LightsOut {
  readonly boyut: number

  /** true = ışık yanıyor. */
  isiklar: boolean[] = []
  hamle = 0

  private readonly random: Uretec

  constructor(boyut: number, karistirma: number, random: Uretec = Math.random) {
    this.boyut = boyut
    this.random = random
    this.yeniBulmaca(karistirma)
  }

  get toplam(): number {
    return this.boyut * this.boyut
  }

  get cozuldu(): boolean {
    return this.isiklar.every((yanik) => !yanik)
  }

  get yanikSayisi(): number {
    return this.isiklar.filter(Boolean).length
  }

  index(satir: number, sutun: number): number {
    return satir * this.boyut + sutun
  }

  yeniBulmaca(karistirma: number): void {
    this.isiklar = Array<boolean>(this.toplam).fill(false)
    this.hamle = 0

    // Sönük tahtadan rastgele basışlarla uzaklaş; en az bir ışık yansın.
    do {
      for (let i = 0; i < karistirma; i++) {
        this.uygula(tamsayi(this.toplam, this.random))
      }
    } while (this.cozuldu)
  }

  /** Oyuncunun basışı: hamleyi sayar. */
  bas(index: number): boolean {
    if (this.cozuldu || index < 0 || index >= this.toplam) return false
    this.uygula(index)
    this.hamle++
    return true
  }

  /** Basışın etkilediği hücreler (kendisi + dört komşu). */
  etkilenenler(index: number): number[] {
    const satir = Math.floor(index / this.boyut)
    const sutun = index % this.boyut
    const adaylar: [number, number][] = [
      [satir, sutun],
      [satir - 1, sutun],
      [satir + 1, sutun],
      [satir, sutun - 1],
      [satir, sutun + 1],
    ]
    return adaylar
      .filter(([s, t]) => s >= 0 && s < this.boyut && t >= 0 && t < this.boyut)
      .map(([s, t]) => this.index(s, t))
  }

  private uygula(index: number): void {
    for (const hedef of this.etkilenenler(index)) {
      this.isiklar[hedef] = !this.isiklar[hedef]
    }
  }
}
