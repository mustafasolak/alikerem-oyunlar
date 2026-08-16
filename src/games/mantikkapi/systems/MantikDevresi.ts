/**
 * Mantık kapıları bulmacası.
 *
 * Devre katman katman kurulur: girişler → kapılar → çıkış.
 * Hedef değer, rastgele bir giriş kombinasyonu değerlendirilerek belirlenir;
 * yani hedefe ulaşan en az bir giriş dizilimi her zaman vardır.
 */

import { birSec, tamsayi, type Uretec } from '../../../shared/rastgele.ts'

export type KapiTuru = 'VE' | 'VEYA' | 'XOR' | 'VEDEĞİL'

export interface Kapi {
  tur: KapiTuru
  /** Girdi kaynakları: {tur:'giris'|'kapi', index} */
  a: { tur: 'giris' | 'kapi'; index: number }
  b: { tur: 'giris' | 'kapi'; index: number }
}

const TURLER: KapiTuru[] = ['VE', 'VEYA', 'XOR', 'VEDEĞİL']

export function kapiUygula(tur: KapiTuru, a: boolean, b: boolean): boolean {
  if (tur === 'VE') return a && b
  if (tur === 'VEYA') return a || b
  if (tur === 'XOR') return a !== b
  return !(a && b)
}

export class MantikDevresi {
  girisler: boolean[] = []
  kapilar: Kapi[] = []
  hedef = true
  hamle = 0

  private readonly random: Uretec

  constructor(girisSayisi: number, kapiSayisi: number, random: Uretec = Math.random) {
    this.random = random
    this.uret(girisSayisi, kapiSayisi)
  }

  /** Kapıların çıkışları, sırayla hesaplanır. */
  kapiCikislari(): boolean[] {
    const sonuc: boolean[] = []
    for (const kapi of this.kapilar) {
      const a = kapi.a.tur === 'giris' ? this.girisler[kapi.a.index] : sonuc[kapi.a.index]
      const b = kapi.b.tur === 'giris' ? this.girisler[kapi.b.index] : sonuc[kapi.b.index]
      sonuc.push(kapiUygula(kapi.tur, Boolean(a), Boolean(b)))
    }
    return sonuc
  }

  get cikis(): boolean {
    const cikislar = this.kapiCikislari()
    return cikislar[cikislar.length - 1] ?? false
  }

  get bitti(): boolean {
    return this.cikis === this.hedef
  }

  cevir(index: number): boolean {
    if (this.bitti || index < 0 || index >= this.girisler.length) return false
    this.girisler[index] = !this.girisler[index]
    this.hamle++
    return true
  }

  uret(girisSayisi: number, kapiSayisi: number): void {
    for (let deneme = 0; deneme < 100; deneme++) {
      this.girisler = Array.from({ length: girisSayisi }, () => this.random() < 0.5)
      this.kapilar = []

      for (let i = 0; i < kapiSayisi; i++) {
        // İlk kapı yalnız girişlerden beslenir; sonrakiler önceki kapıları da kullanabilir
        const kaynakSec = (): { tur: 'giris' | 'kapi'; index: number } =>
          i > 0 && this.random() < 0.5
            ? { tur: 'kapi', index: tamsayi(i, this.random) }
            : { tur: 'giris', index: tamsayi(girisSayisi, this.random) }

        this.kapilar.push({ tur: birSec(TURLER, this.random), a: kaynakSec(), b: kaynakSec() })
      }

      // Hedefi rastgele bir dizilimden al: en az bir çözüm garanti
      const hedefDizilim = Array.from({ length: girisSayisi }, () => this.random() < 0.5)
      const yedek = this.girisler
      this.girisler = hedefDizilim
      this.hedef = this.cikis
      this.girisler = yedek

      // Başlangıç zaten hedefteyse yeniden dene (bulmaca olsun)
      if (!this.bitti) {
        this.hamle = 0
        return
      }
    }
    this.hamle = 0
  }
}
