/**
 * Katmanlı Mahjong Solitaire. Phaser'dan bağımsız.
 *
 * Kurallar:
 *  - Bir taş **serbest** ise alınabilir: üstünde taş yok ve solu ya da sağı boş.
 *  - Aynı simgeli iki serbest taş birlikte kalkar.
 *
 * Tahta her zaman çözülebilir üretilir: taşlar rastgele serpilmez, dolu bir
 * tahtadan geçerli sırayla çift çift **kaldırılarak** üretilir. Kaydedilen
 * kaldırma sırası, en az bir çözümün var olduğunun kanıtıdır.
 */

import { karistir, nTaneSec, type Uretec } from '../../../shared/rastgele.ts'
import { KATLAR, SIMGELER } from '../config/constants.ts'

export interface Tas {
  kat: number
  satir: number
  sutun: number
  simge: string
  alindi: boolean
}

/** Üretim birkaç denemede tutmazsa vazgeçilir; kilitlenmeyi önler. */
const EN_COK_DENEME = 40

export class Mahjong {
  taslar: Tas[] = []
  secili = -1
  eslesenCift = 0

  /**
   * Üretimde kullanılan kaldırma sırası. Taş kaldırmak başka taşı asla
   * kilitlemediği için (serbestlik tek yönlü artar) bu sıra oyun boyunca
   * geçerli kalır — ipucu önce buradan bakar, oyuncu takılmasın.
   */
  private cozumSirasi: [number, number][] = []

  private readonly random: Uretec

  constructor(random: Uretec = Math.random) {
    this.random = random
    this.dagit()
  }

  get kalan(): number {
    return this.taslar.filter((t) => !t.alindi).length
  }

  get toplam(): number {
    return this.taslar.length
  }

  get bitti(): boolean {
    return this.kalan === 0
  }

  // --- Kurallar ---

  /** Bu hücrede duran (alınmamış) taşın sırası; yoksa -1. */
  private tasIndex(kat: number, satir: number, sutun: number): number {
    return this.taslar.findIndex(
      (t) => !t.alindi && t.kat === kat && t.satir === satir && t.sutun === sutun,
    )
  }

  /** Üstünde taş var mı? (bir üst katta aynı hücre) */
  kapaliMi(index: number): boolean {
    const tas = this.taslar[index]
    if (!tas) return true
    return this.tasIndex(tas.kat + 1, tas.satir, tas.sutun) !== -1
  }

  /** Alınabilir mi: üstü açık ve yanlarından biri boş. */
  serbestMi(index: number): boolean {
    const tas = this.taslar[index]
    if (!tas || tas.alindi) return false
    if (this.kapaliMi(index)) return false

    const solDolu = this.tasIndex(tas.kat, tas.satir, tas.sutun - 1) !== -1
    const sagDolu = this.tasIndex(tas.kat, tas.satir, tas.sutun + 1) !== -1
    return !solDolu || !sagDolu
  }

  serbestIndexler(): number[] {
    return this.taslar.map((_, i) => i).filter((i) => this.serbestMi(i))
  }

  // --- Üretim ---

  dagit(): void {
    for (let deneme = 0; deneme < EN_COK_DENEME; deneme++) {
      const cifter = this.kaldirmaSirasiUret()
      if (cifter) {
        this.simgeleriDagit(cifter)
        this.cozumSirasi = cifter
        this.secili = -1
        this.eslesenCift = 0
        return
      }
    }
    // Buraya düşmek pratikte beklenmez; yine de oynanabilir bir tahta bırakalım
    this.taslar = this.bosTahta()
    const basit = this.basitCiftler()
    this.simgeleriDagit(basit)
    this.cozumSirasi = basit
    this.secili = -1
    this.eslesenCift = 0
  }

  /** Kat tanımlarından tüm hücreleri (simgesiz) üretir. */
  private bosTahta(): Tas[] {
    const taslar: Tas[] = []
    KATLAR.forEach((kat, katNo) => {
      for (const satir of kat.satirlar) {
        for (const sutun of kat.sutunlar) {
          taslar.push({ kat: katNo, satir, sutun, simge: '', alindi: false })
        }
      }
    })
    return taslar
  }

  /**
   * Dolu tahtayı geçerli sırayla boşaltır ve kaldırılan çiftleri döner.
   * Bir adımda iki serbest taş kalmazsa null döner (yeniden denenir).
   */
  private kaldirmaSirasiUret(): [number, number][] | null {
    this.taslar = this.bosTahta()
    const cifter: [number, number][] = []

    while (this.kalan > 0) {
      const serbest = karistir(this.serbestIndexler(), this.random)
      if (serbest.length < 2) return null
      const [a, b] = serbest
      this.taslar[a].alindi = true
      this.taslar[b].alindi = true
      cifter.push([a, b])
    }

    for (const tas of this.taslar) tas.alindi = false
    return cifter
  }

  /** Her çifte bir simge verir; simgeler çiftler arasında döngüsel dağıtılır. */
  private simgeleriDagit(cifter: [number, number][]): void {
    const cesitler = nTaneSec(SIMGELER, Math.min(SIMGELER.length, cifter.length), this.random)
    cifter.forEach(([a, b], i) => {
      const simge = cesitler[i % cesitler.length]
      this.taslar[a].simge = simge
      this.taslar[b].simge = simge
    })
  }

  /** Son çare: hücreleri sırayla ikişer eşle (çözülebilirlik garantisi yok). */
  private basitCiftler(): [number, number][] {
    const cifter: [number, number][] = []
    for (let i = 0; i + 1 < this.taslar.length; i += 2) cifter.push([i, i + 1])
    return cifter
  }

  // --- Oynanış ---

  sec(index: number): 'secildi' | 'eslesti' | 'iptal' | 'yok' {
    if (this.bitti || !this.serbestMi(index)) return 'yok'

    if (this.secili === -1) {
      this.secili = index
      return 'secildi'
    }
    if (this.secili === index) {
      this.secili = -1
      return 'iptal'
    }

    const a = this.taslar[this.secili]
    const b = this.taslar[index]
    if (a.simge !== b.simge) {
      this.secili = index
      return 'secildi'
    }

    a.alindi = true
    b.alindi = true
    this.secili = -1
    this.eslesenCift++
    return 'eslesti'
  }

  /** Serbest taşlar arasında eşlenebilir çift var mı? */
  get hamleVarMi(): boolean {
    return this.ipucuCifti() !== null
  }

  /**
   * Oynanabilir bir çift. Önce üretimdeki çözüm sırasına bakılır: böylece
   * ipucuyla oynayan oyuncu tahtayı kilitlemeden bitirebilir. Oyuncu farklı
   * eşleştirmeler yaptıysa (aynı simge başka çiftten) sıra bozulur; o zaman
   * serbest taşlar arasında herhangi bir eşleşme aranır.
   */
  ipucuCifti(): [number, number] | null {
    for (const [a, b] of this.cozumSirasi) {
      if (this.taslar[a].alindi || this.taslar[b].alindi) continue
      if (this.taslar[a].simge !== this.taslar[b].simge) continue
      if (this.serbestMi(a) && this.serbestMi(b)) return [a, b]
    }

    const serbest = this.serbestIndexler()
    for (let i = 0; i < serbest.length; i++) {
      for (let j = i + 1; j < serbest.length; j++) {
        if (this.taslar[serbest[i]].simge === this.taslar[serbest[j]].simge) {
          return [serbest[i], serbest[j]]
        }
      }
    }
    return null
  }

  /**
   * Kilitlenince kalan taşların simgelerini yeniden dağıtır.
   * Kaldırma sırası korunmadığı için çözülebilirlik garanti değildir;
   * hamle kalmadığında tekrar karıştırılabilir.
   */
  karistirKalanlari(): void {
    const kalanlar = this.taslar.filter((t) => !t.alindi)
    const simgeler = karistir(
      kalanlar.map((t) => t.simge),
      this.random,
    )
    kalanlar.forEach((tas, i) => {
      tas.simge = simgeler[i]
    })
    // Simgeler yer değiştirdi; kayıtlı çözüm sırası artık yol gösteremez
    this.cozumSirasi = []
    this.secili = -1
  }
}
