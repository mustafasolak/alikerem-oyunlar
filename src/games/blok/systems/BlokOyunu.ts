/**
 * Blok Yerleştirme: 10×10 tahtaya parça koyulur, dolan satır ve sütunlar temizlenir.
 * Elde üç parça durur; hepsi kullanılınca yenileri gelir.
 * Hiçbir parça sığmıyorsa oyun biter.
 */

import { tamsayi, type Uretec } from '../../../shared/rastgele.ts'
import { BLOK_RENKLERI, BOYUT, EL_SAYISI, HUCRE_PUANI, SATIR_PUANI, SEKILLER } from '../config/constants.ts'

export interface Parca {
  hucreler: [number, number][]
  renk: number
  kullanildi: boolean
}

export interface KoymaSonucu {
  kondu: boolean
  temizlenenSatir: number
  temizlenenSutun: number
  puan: number
}

export class BlokOyunu {
  tahta: number[] = []
  el: Parca[] = []
  skor = 0
  temizlenen = 0

  private readonly random: Uretec

  constructor(random: Uretec = Math.random) {
    this.random = random
    this.reset()
  }

  index(s: number, t: number): number {
    return s * BOYUT + t
  }

  reset(): void {
    this.tahta = Array<number>(BOYUT * BOYUT).fill(-1)
    this.skor = 0
    this.temizlenen = 0
    this.eliYenile()
  }

  eliYenile(): void {
    this.el = Array.from({ length: EL_SAYISI }, () => ({
      hucreler: SEKILLER[tamsayi(SEKILLER.length, this.random)],
      renk: BLOK_RENKLERI[tamsayi(BLOK_RENKLERI.length, this.random)],
      kullanildi: false,
    }))
  }

  /** Parça bu konuma sığıyor mu? */
  sigar(parca: Parca, satir: number, sutun: number): boolean {
    return parca.hucreler.every(([ds, dt]) => {
      const s = satir + ds
      const t = sutun + dt
      return s >= 0 && s < BOYUT && t >= 0 && t < BOYUT && this.tahta[this.index(s, t)] === -1
    })
  }

  koy(elIndex: number, satir: number, sutun: number): KoymaSonucu {
    const bos: KoymaSonucu = { kondu: false, temizlenenSatir: 0, temizlenenSutun: 0, puan: 0 }
    const parca = this.el[elIndex]
    if (!parca || parca.kullanildi || !this.sigar(parca, satir, sutun)) return bos

    for (const [ds, dt] of parca.hucreler) {
      this.tahta[this.index(satir + ds, sutun + dt)] = parca.renk
    }
    parca.kullanildi = true
    let puan = parca.hucreler.length * HUCRE_PUANI

    // Dolan satır ve sütunları belirle, sonra hepsini birlikte temizle
    const doluSatirlar: number[] = []
    const doluSutunlar: number[] = []
    for (let s = 0; s < BOYUT; s++) {
      if (Array.from({ length: BOYUT }, (_, t) => this.tahta[this.index(s, t)]).every((v) => v !== -1)) {
        doluSatirlar.push(s)
      }
    }
    for (let t = 0; t < BOYUT; t++) {
      if (Array.from({ length: BOYUT }, (_, s) => this.tahta[this.index(s, t)]).every((v) => v !== -1)) {
        doluSutunlar.push(t)
      }
    }
    for (const s of doluSatirlar) for (let t = 0; t < BOYUT; t++) this.tahta[this.index(s, t)] = -1
    for (const t of doluSutunlar) for (let s = 0; s < BOYUT; s++) this.tahta[this.index(s, t)] = -1

    const temizlenenAdet = doluSatirlar.length + doluSutunlar.length
    puan += temizlenenAdet * SATIR_PUANI
    this.temizlenen += temizlenenAdet
    this.skor += puan

    if (this.el.every((p) => p.kullanildi)) this.eliYenile()

    return { kondu: true, temizlenenSatir: doluSatirlar.length, temizlenenSutun: doluSutunlar.length, puan }
  }

  /** Elde kalan parçalardan biri tahtaya sığıyor mu? */
  get hamleVarMi(): boolean {
    return this.el.some((parca) => {
      if (parca.kullanildi) return false
      for (let s = 0; s < BOYUT; s++) {
        for (let t = 0; t < BOYUT; t++) {
          if (this.sigar(parca, s, t)) return true
        }
      }
      return false
    })
  }
}
