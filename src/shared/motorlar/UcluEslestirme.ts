/**
 * Üçlü eşleştirme motoru — Match-3 ve Şeker Patlatma bunu kullanır.
 *
 * Tahta baştan üçlü içermeyecek şekilde doldurulur. Takas yalnız bir eşleşme
 * oluşturuyorsa kabul edilir; patlayan taşların yerine üsttekiler kayar.
 */

import { tamsayi, type Uretec } from '../rastgele.ts'

export interface Konum {
  satir: number
  sutun: number
}

export interface TakasSonucu {
  gecerli: boolean
  /** Zincirleme patlamalar; her tur ayrı dizi. */
  turlar: number[][]
  kazanilanPuan: number
}

export class UcluEslestirme {
  readonly boyut: number
  readonly renkSayisi: number

  tahta: number[] = []
  skor = 0
  hamle = 0

  private readonly random: Uretec

  constructor(boyut: number, renkSayisi: number, random: Uretec = Math.random) {
    this.boyut = boyut
    this.renkSayisi = renkSayisi
    this.random = random
    this.doldur()
  }

  index(satir: number, sutun: number): number {
    return satir * this.boyut + sutun
  }

  get toplam(): number {
    return this.boyut * this.boyut
  }

  /** Baştan eşleşme olmayacak şekilde doldur. */
  doldur(): void {
    this.tahta = Array<number>(this.toplam).fill(-1)
    for (let s = 0; s < this.boyut; s++) {
      for (let t = 0; t < this.boyut; t++) {
        const yasak = new Set<number>()
        if (t >= 2 && this.tahta[this.index(s, t - 1)] === this.tahta[this.index(s, t - 2)]) {
          yasak.add(this.tahta[this.index(s, t - 1)])
        }
        if (s >= 2 && this.tahta[this.index(s - 1, t)] === this.tahta[this.index(s - 2, t)]) {
          yasak.add(this.tahta[this.index(s - 1, t)])
        }
        let renk = tamsayi(this.renkSayisi, this.random)
        let guvenlik = 0
        while (yasak.has(renk) && guvenlik++ < 20) renk = tamsayi(this.renkSayisi, this.random)
        this.tahta[this.index(s, t)] = renk
      }
    }
    this.skor = 0
    this.hamle = 0
  }

  /** Tahtadaki üç ve daha uzun dizilerin indeksleri. */
  eslesmeler(): number[] {
    const bulunan = new Set<number>()

    for (let s = 0; s < this.boyut; s++) {
      let uzunluk = 1
      for (let t = 1; t <= this.boyut; t++) {
        const ayni = t < this.boyut && this.tahta[this.index(s, t)] === this.tahta[this.index(s, t - 1)]
        if (ayni) uzunluk++
        else {
          if (uzunluk >= 3) for (let g = 0; g < uzunluk; g++) bulunan.add(this.index(s, t - 1 - g))
          uzunluk = 1
        }
      }
    }
    for (let t = 0; t < this.boyut; t++) {
      let uzunluk = 1
      for (let s = 1; s <= this.boyut; s++) {
        const ayni = s < this.boyut && this.tahta[this.index(s, t)] === this.tahta[this.index(s - 1, t)]
        if (ayni) uzunluk++
        else {
          if (uzunluk >= 3) for (let g = 0; g < uzunluk; g++) bulunan.add(this.index(s - 1 - g, t))
          uzunluk = 1
        }
      }
    }
    return [...bulunan]
  }

  komsuMu(a: Konum, b: Konum): boolean {
    return Math.abs(a.satir - b.satir) + Math.abs(a.sutun - b.sutun) === 1
  }

  /** İki komşu taşı takas eder; eşleşme oluşmazsa geri alır. */
  takas(a: Konum, b: Konum): TakasSonucu {
    const bos: TakasSonucu = { gecerli: false, turlar: [], kazanilanPuan: 0 }
    if (!this.komsuMu(a, b)) return bos

    const ia = this.index(a.satir, a.sutun)
    const ib = this.index(b.satir, b.sutun)
    ;[this.tahta[ia], this.tahta[ib]] = [this.tahta[ib], this.tahta[ia]]

    if (this.eslesmeler().length === 0) {
      ;[this.tahta[ia], this.tahta[ib]] = [this.tahta[ib], this.tahta[ia]]
      return bos
    }

    this.hamle++
    const turlar: number[][] = []
    let puan = 0
    let carpan = 1

    // Zincirleme: patlat, kaydır, tekrar bak
    for (;;) {
      const eslesen = this.eslesmeler()
      if (eslesen.length === 0) break
      turlar.push(eslesen)
      puan += eslesen.length * 10 * carpan
      carpan++
      for (const i of eslesen) this.tahta[i] = -1
      this.kaydir()
    }

    this.skor += puan
    return { gecerli: true, turlar, kazanilanPuan: puan }
  }

  /** Boşalan yerlere üsttekileri indir, tepeyi yeni renklerle doldur. */
  private kaydir(): void {
    for (let t = 0; t < this.boyut; t++) {
      const sutun: number[] = []
      for (let s = this.boyut - 1; s >= 0; s--) {
        const deger = this.tahta[this.index(s, t)]
        if (deger !== -1) sutun.push(deger)
      }
      while (sutun.length < this.boyut) sutun.push(tamsayi(this.renkSayisi, this.random))
      for (let s = 0; s < this.boyut; s++) {
        this.tahta[this.index(this.boyut - 1 - s, t)] = sutun[s]
      }
    }
  }

  /** Oynanabilir bir takas var mı? */
  hamleVarMi(): boolean {
    for (let s = 0; s < this.boyut; s++) {
      for (let t = 0; t < this.boyut; t++) {
        for (const [ds, dt] of [
          [0, 1],
          [1, 0],
        ]) {
          const s2 = s + ds
          const t2 = t + dt
          if (s2 >= this.boyut || t2 >= this.boyut) continue
          const ia = this.index(s, t)
          const ib = this.index(s2, t2)
          ;[this.tahta[ia], this.tahta[ib]] = [this.tahta[ib], this.tahta[ia]]
          const varMi = this.eslesmeler().length > 0
          ;[this.tahta[ia], this.tahta[ib]] = [this.tahta[ib], this.tahta[ia]]
          if (varMi) return true
        }
      }
    }
    return false
  }
}
