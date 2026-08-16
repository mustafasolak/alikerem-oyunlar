/**
 * Spider Solitaire — tek renkli (kolay) sürüm.
 * Şahtan asa inen tam dizi tamamlanınca tahtadan kalkar; sekiz dizi biter.
 */

import { ayniRenkSira, desteYap, type Kart } from '../../../shared/motorlar/Iskambil.ts'
import { GeriAlmaYigini } from '../../../shared/motorlar/GeriAlma.ts'
import { type Uretec } from '../../../shared/rastgele.ts'
import { SUTUN_SAYISI } from '../config/constants.ts'

/** Geri alma için saklanan tam durum. */
interface Durum {
  sutunlar: Kart[][]
  deste: Kart[]
  tamamlanan: number
  hamle: number
}

export class Spider {
  sutunlar: Kart[][] = []
  deste: Kart[] = []
  tamamlanan = 0
  hamle = 0

  private readonly random: Uretec
  private readonly gecmis = new GeriAlmaYigini<Durum>()

  constructor(random: Uretec = Math.random) {
    this.random = random
    this.dagit()
  }

  get geriAlinabilir(): boolean {
    return this.gecmis.doluMu
  }

  private kaydet(): void {
    this.gecmis.kaydet({
      sutunlar: this.sutunlar,
      deste: this.deste,
      tamamlanan: this.tamamlanan,
      hamle: this.hamle,
    })
  }

  /** Son hamleyi geri alır; geri alma da bir hamle sayılır. */
  geriAl(): boolean {
    const onceki = this.gecmis.al()
    if (!onceki) return false
    this.sutunlar = onceki.sutunlar
    this.deste = onceki.deste
    this.tamamlanan = onceki.tamamlanan
    this.hamle = onceki.hamle + 1
    return true
  }

  get bitti(): boolean {
    return this.tamamlanan === 8
  }

  dagit(): void {
    // Tek renk: 8 deste maça (104 kart)
    const kartlar = desteYap(8, ['maca'], this.random)
    this.sutunlar = Array.from({ length: SUTUN_SAYISI }, () => [])

    let sira = 0
    for (let s = 0; s < SUTUN_SAYISI; s++) {
      const adet = s < 4 ? 6 : 5
      for (let k = 0; k < adet; k++) {
        const kart = kartlar[sira++]
        kart.acik = k === adet - 1
        this.sutunlar[s].push(kart)
      }
    }
    this.deste = kartlar.slice(sira)
    this.tamamlanan = 0
    this.hamle = 0
    this.gecmis.temizle()
  }

  /** Sütundaki kart indeksinden itibaren inen dizi taşınabilir mi? */
  tasinabilir(sutun: number, kartIndex: number): boolean {
    const kartlar = this.sutunlar[sutun]
    if (kartIndex < 0 || kartIndex >= kartlar.length || !kartlar[kartIndex].acik) return false
    for (let i = kartIndex; i < kartlar.length - 1; i++) {
      if (!ayniRenkSira(kartlar[i + 1], kartlar[i])) return false
    }
    return true
  }

  tasi(kaynak: number, kartIndex: number, hedef: number): boolean {
    if (kaynak === hedef || !this.tasinabilir(kaynak, kartIndex)) return false
    const tasinan = this.sutunlar[kaynak].slice(kartIndex)
    const hedefSutun = this.sutunlar[hedef]

    if (hedefSutun.length > 0) {
      const ust = hedefSutun[hedefSutun.length - 1]
      if (!ust.acik || tasinan[0].deger !== ust.deger - 1) return false
    }

    this.kaydet()
    this.sutunlar[kaynak].splice(kartIndex)
    hedefSutun.push(...tasinan)
    const kalan = this.sutunlar[kaynak]
    if (kalan.length > 0) kalan[kalan.length - 1].acik = true

    this.hamle++
    this.tamDiziyiTopla(hedef)
    return true
  }

  /** Sütunun sonunda şahtan asa tam dizi varsa kaldırır. */
  private tamDiziyiTopla(sutun: number): void {
    const kartlar = this.sutunlar[sutun]
    if (kartlar.length < 13) return
    const bas = kartlar.length - 13
    if (kartlar[bas].deger !== 13 || !kartlar[bas].acik) return
    for (let i = bas; i < kartlar.length - 1; i++) {
      if (!ayniRenkSira(kartlar[i + 1], kartlar[i])) return
    }
    kartlar.splice(bas)
    if (kartlar.length > 0) kartlar[kartlar.length - 1].acik = true
    this.tamamlanan++
  }

  /** Desteden her sütuna birer kart dağıtır. */
  desteDagit(): boolean {
    if (this.deste.length < SUTUN_SAYISI) return false
    if (this.sutunlar.some((s) => s.length === 0)) return false
    this.kaydet()
    for (let s = 0; s < SUTUN_SAYISI; s++) {
      const kart = this.deste.pop()!
      kart.acik = true
      this.sutunlar[s].push(kart)
      this.tamDiziyiTopla(s)
    }
    this.hamle++
    return true
  }
}
