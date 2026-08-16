/**
 * Sokoban mantığı. Oyuncu kutuyu ancak itebilir; arkasında boş yer olmalı.
 * Geri alma için her hamlenin öncesi yığında tutulur.
 */

export type Yon = 'up' | 'down' | 'left' | 'right'

export interface Konum {
  satir: number
  sutun: number
}

const VEKTOR: Record<Yon, Konum> = {
  up: { satir: -1, sutun: 0 },
  down: { satir: 1, sutun: 0 },
  left: { satir: 0, sutun: -1 },
  right: { satir: 0, sutun: 1 },
}

interface Anlik {
  oyuncu: Konum
  kutular: string[]
}

const anahtar = (k: Konum): string => `${k.satir},${k.sutun}`

export class Sokoban {
  duvarlar = new Set<string>()
  hedefler = new Set<string>()
  kutular = new Set<string>()
  oyuncu: Konum = { satir: 0, sutun: 0 }
  satirSayisi = 0
  sutunSayisi = 0
  hamle = 0

  private gecmis: Anlik[] = []

  constructor(harita: string[]) {
    this.yukle(harita)
  }

  get bitti(): boolean {
    return [...this.hedefler].every((h) => this.kutular.has(h))
  }

  duvarMi(satir: number, sutun: number): boolean {
    return this.duvarlar.has(`${satir},${sutun}`)
  }

  hedefMi(satir: number, sutun: number): boolean {
    return this.hedefler.has(`${satir},${sutun}`)
  }

  kutuMu(satir: number, sutun: number): boolean {
    return this.kutular.has(`${satir},${sutun}`)
  }

  yukle(harita: string[]): void {
    this.duvarlar.clear()
    this.hedefler.clear()
    this.kutular.clear()
    this.gecmis = []
    this.hamle = 0
    this.satirSayisi = harita.length
    this.sutunSayisi = Math.max(...harita.map((s) => s.length))

    harita.forEach((satirYazi, satir) => {
      ;[...satirYazi].forEach((karakter, sutun) => {
        const yer = `${satir},${sutun}`
        if (karakter === '#') this.duvarlar.add(yer)
        if (karakter === '.' || karakter === '*' || karakter === '+') this.hedefler.add(yer)
        if (karakter === '$' || karakter === '*') this.kutular.add(yer)
        if (karakter === '@' || karakter === '+') this.oyuncu = { satir, sutun }
      })
    })
  }

  git(yon: Yon): boolean {
    if (this.bitti) return false
    const v = VEKTOR[yon]
    const hedef = { satir: this.oyuncu.satir + v.satir, sutun: this.oyuncu.sutun + v.sutun }
    if (this.duvarMi(hedef.satir, hedef.sutun)) return false

    const oncesi: Anlik = { oyuncu: { ...this.oyuncu }, kutular: [...this.kutular] }

    if (this.kutuMu(hedef.satir, hedef.sutun)) {
      const arka = { satir: hedef.satir + v.satir, sutun: hedef.sutun + v.sutun }
      // Kutunun arkası duvar ya da başka kutuysa itilemez.
      if (this.duvarMi(arka.satir, arka.sutun) || this.kutuMu(arka.satir, arka.sutun)) return false
      this.kutular.delete(anahtar(hedef))
      this.kutular.add(anahtar(arka))
    }

    this.gecmis.push(oncesi)
    this.oyuncu = hedef
    this.hamle++
    return true
  }

  geriAl(): boolean {
    const oncesi = this.gecmis.pop()
    if (!oncesi) return false
    this.oyuncu = oncesi.oyuncu
    this.kutular = new Set(oncesi.kutular)
    this.hamle++
    return true
  }
}
