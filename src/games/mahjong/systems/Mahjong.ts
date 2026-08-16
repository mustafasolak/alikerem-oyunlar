/**
 * Tek katmanlı Mahjong.
 *
 * Bir taş ancak solu ya da sağı boşsa alınabilir ("serbest").
 * Taşlar çiftler hâlinde dağıtıldığı için tahta her zaman eşlenebilir;
 * kilitlenme olursa oyun kalan taşları yeniden karıştırır.
 */

import { karistir, nTaneSec, type Uretec } from '../../../shared/rastgele.ts'
import { SATIR, SIMGELER, SUTUN } from '../config/constants.ts'

export interface Tas {
  simge: string
  alindi: boolean
}

export class Mahjong {
  taslar: (Tas | null)[] = []
  secili = -1
  eslesenCift = 0

  private readonly random: Uretec

  constructor(random: Uretec = Math.random) {
    this.random = random
    this.dagit()
  }

  index(s: number, t: number): number {
    return s * SUTUN + t
  }

  get kalan(): number {
    return this.taslar.filter((t) => t && !t.alindi).length
  }

  get bitti(): boolean {
    return this.kalan === 0
  }

  dagit(): void {
    const toplamHucre = SUTUN * SATIR
    const ciftSayisi = Math.floor(toplamHucre / 2)
    const cesitler = nTaneSec(SIMGELER, Math.min(SIMGELER.length, ciftSayisi), this.random)

    const havuz: string[] = []
    for (let i = 0; i < ciftSayisi; i++) {
      const simge = cesitler[i % cesitler.length]
      havuz.push(simge, simge)
    }

    const karisik = karistir(havuz, this.random)
    this.taslar = Array.from({ length: toplamHucre }, (_, i) =>
      i < karisik.length ? { simge: karisik[i], alindi: false } : null,
    )
    this.secili = -1
    this.eslesenCift = 0
  }

  /** Solu ya da sağı boş mu? */
  serbestMi(index: number): boolean {
    const tas = this.taslar[index]
    if (!tas || tas.alindi) return false
    const s = Math.floor(index / SUTUN)
    const t = index % SUTUN

    const doluMu = (tt: number): boolean => {
      if (tt < 0 || tt >= SUTUN) return false
      const komsu = this.taslar[this.index(s, tt)]
      return Boolean(komsu && !komsu.alindi)
    }
    return !doluMu(t - 1) || !doluMu(t + 1)
  }

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

    const a = this.taslar[this.secili]!
    const b = this.taslar[index]!
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
    const serbestler = this.taslar
      .map((t, i) => ({ t, i }))
      .filter(({ t, i }) => t && !t.alindi && this.serbestMi(i))
    const sayim = new Map<string, number>()
    for (const { t } of serbestler) sayim.set(t!.simge, (sayim.get(t!.simge) ?? 0) + 1)
    return [...sayim.values()].some((n) => n >= 2)
  }

  /** Kilitlenme durumunda kalan taşları yeniden karıştır. */
  karistirKalanlari(): void {
    const kalanlar = this.taslar.filter((t) => t && !t.alindi).map((t) => t!.simge)
    const karisik = karistir(kalanlar, this.random)
    let k = 0
    for (const tas of this.taslar) {
      if (tas && !tas.alindi) tas.simge = karisik[k++]
    }
    this.secili = -1
  }
}
