/**
 * Kelime Bulmaca üretimi ve oyun durumu. Phaser'dan bağımsız.
 *
 * Üretim: ilk kelime ortaya yatay konur, sonraki her kelime yerleşmiş bir
 * kelimeyle kesişecek şekilde denenir. Yerleşim geçerli sayılması için
 * istenmeyen yan yana harf dizileri oluşturmamalıdır.
 */

import { kelimeleriSec, type KelimeKaydi } from '../../../shared/kelimeler.ts'
import { karistir, nTaneSec, type Uretec } from '../../../shared/rastgele.ts'
import { CALISMA_BOYUTU, KELIME_SAYISI, MAX_KELIME, MIN_KELIME } from '../config/constants.ts'

export type Yon = 'yatay' | 'dikey'

export interface Yerlesim {
  numara: number
  kelime: string
  ipucu: string
  satir: number
  sutun: number
  yon: Yon
}

export interface Hucre {
  satir: number
  sutun: number
}

export class Crossword {
  /** Doğru harfler; boş hücreler null. */
  cozum: (string | null)[][] = []
  /** Oyuncunun girdiği harfler. */
  girilen: (string | null)[][] = []
  yerlesimler: Yerlesim[] = []
  satirSayisi = 0
  sutunSayisi = 0

  private readonly random: Uretec

  constructor(random: Uretec = Math.random) {
    this.random = random
    this.reset()
  }

  get tamamlandi(): boolean {
    return this.yerlesimler.length > 0 && this.yerlesimler.every((y) => this.kelimeCozuldu(y))
  }

  get cozulenSayisi(): number {
    return this.yerlesimler.filter((y) => this.kelimeCozuldu(y)).length
  }

  get kalan(): number {
    return this.yerlesimler.length - this.cozulenSayisi
  }

  reset(): void {
    // Yerleşim rastgele olduğu için bazen az kelime oturur; makul bir bulmaca çıkana kadar dene.
    for (let deneme = 0; deneme < 12; deneme++) {
      if (this.uret() && this.yerlesimler.length >= 5) return
    }
  }

  hucreDolu(satir: number, sutun: number): boolean {
    return this.cozum[satir]?.[sutun] != null
  }

  kelimeHucreleri(yerlesim: Yerlesim): Hucre[] {
    return [...yerlesim.kelime].map((_, i) => ({
      satir: yerlesim.satir + (yerlesim.yon === 'dikey' ? i : 0),
      sutun: yerlesim.sutun + (yerlesim.yon === 'yatay' ? i : 0),
    }))
  }

  kelimeCozuldu(yerlesim: Yerlesim): boolean {
    return this.kelimeHucreleri(yerlesim).every(
      (h, i) => this.girilen[h.satir][h.sutun] === yerlesim.kelime[i],
    )
  }

  /** Bu hücreden geçen kelimeler. */
  hucredekiKelimeler(satir: number, sutun: number): Yerlesim[] {
    return this.yerlesimler.filter((y) =>
      this.kelimeHucreleri(y).some((h) => h.satir === satir && h.sutun === sutun),
    )
  }

  harfYaz(satir: number, sutun: number, harf: string | null): boolean {
    if (!this.hucreDolu(satir, sutun)) return false
    this.girilen[satir][sutun] = harf
    return true
  }

  // --- Üretim ---

  private uret(): boolean {
    const havuz = kelimeleriSec(MIN_KELIME, MAX_KELIME)
    const secilenler = nTaneSec(havuz, KELIME_SAYISI * 3, this.random)
      .slice()
      .sort((a, b) => b.kelime.length - a.kelime.length)
    if (secilenler.length === 0) return false

    const boyut = CALISMA_BOYUTU
    const izgara: (string | null)[][] = Array.from({ length: boyut }, () => Array<string | null>(boyut).fill(null))
    const yerlesimler: Omit<Yerlesim, 'numara'>[] = []

    const ilk = secilenler[0]
    const ilkSatir = Math.floor(boyut / 2)
    const ilkSutun = Math.floor((boyut - ilk.kelime.length) / 2)
    this.yaz(izgara, ilk.kelime, ilkSatir, ilkSutun, 'yatay')
    yerlesimler.push({ kelime: ilk.kelime, ipucu: ilk.ipucu, satir: ilkSatir, sutun: ilkSutun, yon: 'yatay' })

    for (const aday of secilenler.slice(1)) {
      if (yerlesimler.length >= KELIME_SAYISI) break
      if (yerlesimler.some((y) => y.kelime === aday.kelime)) continue
      const yer = this.yerBul(izgara, aday, yerlesimler)
      if (!yer) continue
      this.yaz(izgara, aday.kelime, yer.satir, yer.sutun, yer.yon)
      yerlesimler.push({ kelime: aday.kelime, ipucu: aday.ipucu, satir: yer.satir, sutun: yer.sutun, yon: yer.yon })
    }

    if (yerlesimler.length < 2) return false
    this.kirpVeNumaralandir(izgara, yerlesimler)
    return true
  }

  /** Yerleşmiş kelimelerle kesişen geçerli bir konum arar. */
  private yerBul(
    izgara: (string | null)[][],
    aday: KelimeKaydi,
    yerlesimler: Omit<Yerlesim, 'numara'>[],
  ): { satir: number; sutun: number; yon: Yon } | null {
    const adaylar: { satir: number; sutun: number; yon: Yon }[] = []

    for (const yerlesik of karistir(yerlesimler, this.random)) {
      const yeniYon: Yon = yerlesik.yon === 'yatay' ? 'dikey' : 'yatay'

      for (let i = 0; i < yerlesik.kelime.length; i++) {
        const kesisimSatir = yerlesik.satir + (yerlesik.yon === 'dikey' ? i : 0)
        const kesisimSutun = yerlesik.sutun + (yerlesik.yon === 'yatay' ? i : 0)
        const harf = yerlesik.kelime[i]

        for (let j = 0; j < aday.kelime.length; j++) {
          if (aday.kelime[j] !== harf) continue
          const satir = yeniYon === 'dikey' ? kesisimSatir - j : kesisimSatir
          const sutun = yeniYon === 'yatay' ? kesisimSutun - j : kesisimSutun
          if (this.konabilir(izgara, aday.kelime, satir, sutun, yeniYon)) {
            adaylar.push({ satir, sutun, yon: yeniYon })
          }
        }
      }
    }

    return adaylar.length > 0 ? karistir(adaylar, this.random)[0] : null
  }

  /**
   * Yerleşim kuralları:
   *  - ızgaraya sığmalı, dolu hücrelerde harf uyuşmalı
   *  - boş hücrelere yazarken yan komşuları boş olmalı (istenmeyen kelime oluşmasın)
   *  - kelimenin hemen öncesi ve sonrası boş olmalı
   *  - en az bir kesişim olmalı
   */
  private konabilir(
    izgara: (string | null)[][],
    kelime: string,
    satir: number,
    sutun: number,
    yon: Yon,
  ): boolean {
    const boyut = izgara.length
    const dSatir = yon === 'dikey' ? 1 : 0
    const dSutun = yon === 'yatay' ? 1 : 0

    const bitisSatir = satir + dSatir * (kelime.length - 1)
    const bitisSutun = sutun + dSutun * (kelime.length - 1)
    if (satir < 0 || sutun < 0 || bitisSatir >= boyut || bitisSutun >= boyut) return false

    // Baş ve son komşuları boş olmalı.
    const onceSatir = satir - dSatir
    const onceSutun = sutun - dSutun
    if (onceSatir >= 0 && onceSutun >= 0 && izgara[onceSatir][onceSutun] != null) return false
    const sonraSatir = bitisSatir + dSatir
    const sonraSutun = bitisSutun + dSutun
    if (sonraSatir < boyut && sonraSutun < boyut && izgara[sonraSatir][sonraSutun] != null) return false

    let kesisim = 0
    for (let i = 0; i < kelime.length; i++) {
      const r = satir + dSatir * i
      const c = sutun + dSutun * i
      const mevcut = izgara[r][c]

      if (mevcut != null) {
        if (mevcut !== kelime[i]) return false
        kesisim++
        continue
      }
      // Boş hücreye yazıyoruz: yanları da boş olmalı.
      const yanlar: [number, number][] =
        yon === 'yatay'
          ? [
              [r - 1, c],
              [r + 1, c],
            ]
          : [
              [r, c - 1],
              [r, c + 1],
            ]
      for (const [yr, yc] of yanlar) {
        if (yr < 0 || yr >= boyut || yc < 0 || yc >= boyut) continue
        if (izgara[yr][yc] != null) return false
      }
    }
    return kesisim > 0
  }

  private yaz(izgara: (string | null)[][], kelime: string, satir: number, sutun: number, yon: Yon): void {
    for (let i = 0; i < kelime.length; i++) {
      const r = satir + (yon === 'dikey' ? i : 0)
      const c = sutun + (yon === 'yatay' ? i : 0)
      izgara[r][c] = kelime[i]
    }
  }

  /** Boş kenarları atar ve kelimelere klasik çengel numaralarını verir. */
  private kirpVeNumaralandir(izgara: (string | null)[][], yerlesimler: Omit<Yerlesim, 'numara'>[]): void {
    let minSatir = Infinity
    let maxSatir = -Infinity
    let minSutun = Infinity
    let maxSutun = -Infinity

    for (let r = 0; r < izgara.length; r++) {
      for (let c = 0; c < izgara.length; c++) {
        if (izgara[r][c] == null) continue
        minSatir = Math.min(minSatir, r)
        maxSatir = Math.max(maxSatir, r)
        minSutun = Math.min(minSutun, c)
        maxSutun = Math.max(maxSutun, c)
      }
    }

    this.satirSayisi = maxSatir - minSatir + 1
    this.sutunSayisi = maxSutun - minSutun + 1
    this.cozum = Array.from({ length: this.satirSayisi }, (_, r) =>
      Array.from({ length: this.sutunSayisi }, (_, c) => izgara[r + minSatir][c + minSutun]),
    )
    this.girilen = Array.from({ length: this.satirSayisi }, () =>
      Array<string | null>(this.sutunSayisi).fill(null),
    )

    const kaydirilmis = yerlesimler.map((y) => ({
      ...y,
      satir: y.satir - minSatir,
      sutun: y.sutun - minSutun,
    }))

    // Başlangıç hücreleri satır-sütun sırasına göre numaralanır; aynı hücreden
    // başlayan yatay ve dikey kelimeler aynı numarayı paylaşır.
    const numaralar = new Map<string, number>()
    let sonraki = 1
    for (const y of kaydirilmis.slice().sort((a, b) => a.satir - b.satir || a.sutun - b.sutun)) {
      const anahtar = `${y.satir},${y.sutun}`
      if (!numaralar.has(anahtar)) numaralar.set(anahtar, sonraki++)
    }

    this.yerlesimler = kaydirilmis
      .map((y) => ({ ...y, numara: numaralar.get(`${y.satir},${y.sutun}`) ?? 0 }))
      .sort((a, b) => a.numara - b.numara)
  }
}
