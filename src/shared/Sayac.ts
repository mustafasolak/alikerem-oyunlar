/** Geçen süreyi tutan basit sayaç. Duraklatılabilir, sıfırlanabilir. */

export class Sayac {
  private baslangic = 0
  private birikmis = 0
  private calisiyor = false

  basla(): void {
    if (this.calisiyor) return
    this.baslangic = Date.now()
    this.calisiyor = true
  }

  durdur(): void {
    if (!this.calisiyor) return
    this.birikmis += Date.now() - this.baslangic
    this.calisiyor = false
  }

  sifirla(): void {
    this.birikmis = 0
    this.baslangic = Date.now()
    this.calisiyor = false
  }

  get milisaniye(): number {
    return this.birikmis + (this.calisiyor ? Date.now() - this.baslangic : 0)
  }

  get saniye(): number {
    return Math.floor(this.milisaniye / 1000)
  }

  /** "1:05" biçimi. */
  get yazi(): string {
    const total = this.saniye
    const dakika = Math.floor(total / 60)
    const saniye = total % 60
    return `${dakika}:${String(saniye).padStart(2, '0')}`
  }
}
