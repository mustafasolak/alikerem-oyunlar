/**
 * Hanoi Kuleleri mantığı. Her çubuk bir yığın; üstte en küçük disk durur.
 * Disk numarası büyüdükçe disk büyür.
 */

import { CUBUK_SAYISI } from '../config/constants.ts'

export class Hanoi {
  readonly diskSayisi: number

  /** cubuklar[i] = alttan üste disk numaraları (büyükten küçüğe). */
  cubuklar: number[][] = []
  hamle = 0

  constructor(diskSayisi: number) {
    this.diskSayisi = diskSayisi
    this.reset()
  }

  reset(): void {
    this.cubuklar = Array.from({ length: CUBUK_SAYISI }, () => [] as number[])
    for (let disk = this.diskSayisi; disk >= 1; disk--) {
      this.cubuklar[0].push(disk)
    }
    this.hamle = 0
  }

  ust(cubuk: number): number | null {
    const yigin = this.cubuklar[cubuk]
    return yigin.length > 0 ? yigin[yigin.length - 1] : null
  }

  /** Kaynaktan hedefe taşınabilir mi? */
  gecerliMi(kaynak: number, hedef: number): boolean {
    if (kaynak === hedef) return false
    const tasinacak = this.ust(kaynak)
    if (tasinacak === null) return false
    const ustteki = this.ust(hedef)
    return ustteki === null || tasinacak < ustteki
  }

  tasi(kaynak: number, hedef: number): boolean {
    if (this.bitti || !this.gecerliMi(kaynak, hedef)) return false
    this.cubuklar[hedef].push(this.cubuklar[kaynak].pop()!)
    this.hamle++
    return true
  }

  /** Bütün diskler son çubukta mı? */
  get bitti(): boolean {
    return this.cubuklar[CUBUK_SAYISI - 1].length === this.diskSayisi
  }
}
