/** Hafıza Kartları mantığı: kart dizilimi, çevirme ve eşleşme denetimi. */

import { karistir, nTaneSec, type Uretec } from '../../../shared/rastgele.ts'
import { SIMGELER } from '../config/constants.ts'

export interface Kart {
  id: number
  simge: string
  acik: boolean
  eslesti: boolean
}

export type CevirmeSonucu =
  | { tur: 'yok' }
  | { tur: 'acildi' }
  | { tur: 'eslesti'; kartlar: [number, number] }
  | { tur: 'tutmadi'; kartlar: [number, number] }

export class HafizaOyunu {
  kartlar: Kart[] = []
  hamle = 0
  /** Açık ama henüz eşleşmemiş kartların indeksleri. */
  private acikOlanlar: number[] = []

  private readonly random: Uretec

  constructor(sutun: number, satir: number, random: Uretec = Math.random) {
    this.random = random
    this.dagit(sutun, satir)
  }

  get toplam(): number {
    return this.kartlar.length
  }

  get eslesenCift(): number {
    return this.kartlar.filter((k) => k.eslesti).length / 2
  }

  get toplamCift(): number {
    return this.kartlar.length / 2
  }

  get bitti(): boolean {
    return this.kartlar.every((k) => k.eslesti)
  }

  dagit(sutun: number, satir: number): void {
    const ciftSayisi = Math.floor((sutun * satir) / 2)
    const secilen = nTaneSec(SIMGELER, ciftSayisi, this.random)
    const havuz = karistir([...secilen, ...secilen], this.random)

    this.kartlar = havuz.map((simge, id) => ({ id, simge, acik: false, eslesti: false }))
    this.hamle = 0
    this.acikOlanlar = []
  }

  /** İki kart açıkken üçüncüye basılırsa önce onları kapatmak gerekir. */
  get beklemede(): boolean {
    return this.acikOlanlar.length >= 2
  }

  cevir(index: number): CevirmeSonucu {
    const kart = this.kartlar[index]
    if (this.bitti || this.beklemede || !kart || kart.acik || kart.eslesti) return { tur: 'yok' }

    kart.acik = true
    this.acikOlanlar.push(index)
    if (this.acikOlanlar.length < 2) return { tur: 'acildi' }

    this.hamle++
    const [a, b] = this.acikOlanlar as [number, number]
    if (this.kartlar[a].simge === this.kartlar[b].simge) {
      this.kartlar[a].eslesti = true
      this.kartlar[b].eslesti = true
      this.acikOlanlar = []
      return { tur: 'eslesti', kartlar: [a, b] }
    }
    return { tur: 'tutmadi', kartlar: [a, b] }
  }

  /** Tutmayan çifti kapatır. */
  kapat(): void {
    for (const index of this.acikOlanlar) {
      this.kartlar[index].acik = false
    }
    this.acikOlanlar = []
  }
}
