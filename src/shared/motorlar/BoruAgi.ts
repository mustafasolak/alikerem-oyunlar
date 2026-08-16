/**
 * Boru/kablo ağı motoru — Boru Bağlama, Su Borusu ve Elektrik Devresi bunu kullanır.
 *
 * Her hücrenin dört kenarında bağlantı olabilir; hücre döndürüldükçe bağlantılar kayar.
 * Ağ, kaynaktan yayılan bir ağaç olarak üretilir (her hücreye tek yol) ve sonra
 * hücreler rastgele döndürülerek bulmaca oluşturulur. Bu yüzden her zaman çözülebilir.
 */

import { tamsayi, type Uretec } from '../rastgele.ts'

/** Bit maskesi: 1 üst, 2 sağ, 4 alt, 8 sol. */
export const UST = 1
export const SAG = 2
export const ALT = 4
export const SOL = 8

export interface Konum {
  satir: number
  sutun: number
}

const YONLER: { bit: number; ds: number; dt: number; karsi: number }[] = [
  { bit: UST, ds: -1, dt: 0, karsi: ALT },
  { bit: SAG, ds: 0, dt: 1, karsi: SOL },
  { bit: ALT, ds: 1, dt: 0, karsi: UST },
  { bit: SOL, ds: 0, dt: -1, karsi: SAG },
]

/** Maskeyi saat yönünde 90° döndürür. */
export function dondur(maske: number): number {
  return ((maske << 1) | (maske >> 3)) & 0b1111
}

export class BoruAgi {
  readonly boyut: number

  /** Her hücrenin bağlantı maskesi (oyuncunun gördüğü hâli). */
  hucreler: number[] = []
  /** Üretimdeki doğru yönler; ipucu vermek ve doğrulamak için saklanır. */
  cozum: number[] = []
  kaynak: Konum = { satir: 0, sutun: 0 }
  hamle = 0

  private readonly random: Uretec

  constructor(boyut: number, random: Uretec = Math.random) {
    this.boyut = boyut
    this.random = random
    this.uret()
  }

  index(satir: number, sutun: number): number {
    return satir * this.boyut + sutun
  }

  get toplam(): number {
    return this.boyut * this.boyut
  }

  /** Kaynaktan akım/su ulaşan hücrelerin indeksleri. */
  baglilar(): Set<number> {
    const gorulen = new Set<number>([this.index(this.kaynak.satir, this.kaynak.sutun)])
    const kuyruk: Konum[] = [this.kaynak]

    while (kuyruk.length > 0) {
      const su = kuyruk.shift()!
      const maske = this.hucreler[this.index(su.satir, su.sutun)]
      for (const yon of YONLER) {
        if (!(maske & yon.bit)) continue
        const s = su.satir + yon.ds
        const t = su.sutun + yon.dt
        if (s < 0 || s >= this.boyut || t < 0 || t >= this.boyut) continue
        const komsuIndex = this.index(s, t)
        if (gorulen.has(komsuIndex)) continue
        // Karşılıklı bağlantı şart
        if (!(this.hucreler[komsuIndex] & yon.karsi)) continue
        gorulen.add(komsuIndex)
        kuyruk.push({ satir: s, sutun: t })
      }
    }
    return gorulen
  }

  get kalan(): number {
    return this.toplam - this.baglilar().size
  }

  get bitti(): boolean {
    return this.kalan === 0
  }

  /** Tahtayı çözülmüş hâline getirir (ipucu / doğrulama). */
  cozumuUygula(): void {
    this.hucreler = this.cozum.slice()
  }

  cevir(index: number): boolean {
    if (this.bitti || index < 0 || index >= this.toplam) return false
    this.hucreler[index] = dondur(this.hucreler[index])
    this.hamle++
    return true
  }

  uret(): void {
    // 1) Kaynaktan yayılan rastgele bir kapsayan ağaç kur
    const maskeler = Array<number>(this.toplam).fill(0)
    this.kaynak = { satir: tamsayi(this.boyut, this.random), sutun: tamsayi(this.boyut, this.random) }

    const gorulen = new Set<number>([this.index(this.kaynak.satir, this.kaynak.sutun)])
    const sinir: { den: Konum; ye: Konum; bit: number; karsi: number }[] = []

    const sinirEkle = (k: Konum): void => {
      for (const yon of YONLER) {
        const s = k.satir + yon.ds
        const t = k.sutun + yon.dt
        if (s < 0 || s >= this.boyut || t < 0 || t >= this.boyut) continue
        if (gorulen.has(this.index(s, t))) continue
        sinir.push({ den: k, ye: { satir: s, sutun: t }, bit: yon.bit, karsi: yon.karsi })
      }
    }
    sinirEkle(this.kaynak)

    while (sinir.length > 0) {
      const secim = tamsayi(sinir.length, this.random)
      const kenar = sinir[secim]
      sinir.splice(secim, 1)
      const yeIndex = this.index(kenar.ye.satir, kenar.ye.sutun)
      if (gorulen.has(yeIndex)) continue

      maskeler[this.index(kenar.den.satir, kenar.den.sutun)] |= kenar.bit
      maskeler[yeIndex] |= kenar.karsi
      gorulen.add(yeIndex)
      sinirEkle(kenar.ye)
    }

    // 2) Hücreleri rastgele döndürerek bulmacayı karıştır
    this.cozum = maskeler.slice()
    this.hucreler = maskeler.slice()
    do {
      this.hucreler = maskeler.map((m) => {
        let sonuc = m
        const kere = tamsayi(4, this.random)
        for (let i = 0; i < kere; i++) sonuc = dondur(sonuc)
        return sonuc
      })
    } while (this.bitti)

    this.hamle = 0
  }
}

/** Maskenin uçları: çizim için hangi yönlere kol uzanıyor. */
export function kollar(maske: number): { ust: boolean; sag: boolean; alt: boolean; sol: boolean } {
  return {
    ust: (maske & UST) !== 0,
    sag: (maske & SAG) !== 0,
    alt: (maske & ALT) !== 0,
    sol: (maske & SOL) !== 0,
  }
}
