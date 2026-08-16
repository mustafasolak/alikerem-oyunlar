/**
 * Sudoku'nun saf mantığı: bulmaca üretimi ve oyun durumu. Phaser'dan bağımsız.
 *
 * Üretim iki adımdır:
 *  1) Geri izlemeli doldurma ile geçerli tam bir çözüm üret.
 *  2) Tek çözümlülük bozulmadığı sürece hücreleri boşalt.
 */

import { karistir, type Uretec } from '../../../shared/rastgele.ts'
import { BOYUT, KUTU, VARSAYILAN_ZORLUK, ZORLUKLAR, type Zorluk } from '../config/constants.ts'

const TOPLAM = BOYUT * BOYUT
const RAKAMLAR = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export const satirNo = (index: number): number => Math.floor(index / BOYUT)
export const sutunNo = (index: number): number => index % BOYUT
export const kutuNo = (index: number): number =>
  Math.floor(satirNo(index) / KUTU) * KUTU + Math.floor(sutunNo(index) / KUTU)

/** Bu değer bu hücreye konabilir mi? (tahtadaki mevcut değerlere göre) */
export function uygunMu(tahta: number[], index: number, deger: number): boolean {
  const satir = satirNo(index)
  const sutun = sutunNo(index)
  const kutuSatir = Math.floor(satir / KUTU) * KUTU
  const kutuSutun = Math.floor(sutun / KUTU) * KUTU

  for (let i = 0; i < BOYUT; i++) {
    if (i !== sutun && tahta[satir * BOYUT + i] === deger) return false
    if (i !== satir && tahta[i * BOYUT + sutun] === deger) return false
  }
  for (let r = 0; r < KUTU; r++) {
    for (let c = 0; c < KUTU; c++) {
      const hedef = (kutuSatir + r) * BOYUT + (kutuSutun + c)
      if (hedef !== index && tahta[hedef] === deger) return false
    }
  }
  return true
}

/** Geri izlemeyle tahtayı doldurur. */
function doldur(tahta: number[], random: Uretec): boolean {
  const bos = tahta.indexOf(0)
  if (bos === -1) return true

  for (const deger of karistir(RAKAMLAR, random)) {
    if (!uygunMu(tahta, bos, deger)) continue
    tahta[bos] = deger
    if (doldur(tahta, random)) return true
    tahta[bos] = 0
  }
  return false
}

/**
 * En az adayı olan boş hücreyi bulur (MRV sezgiseli).
 * Adayı hiç olmayan hücre varsa çözüm yoktur; `{ index, adaylar: [] }` döner.
 */
function enKisitliBos(tahta: number[]): { index: number; adaylar: number[] } {
  let enIyi = { index: -1, adaylar: RAKAMLAR }
  for (let i = 0; i < TOPLAM; i++) {
    if (tahta[i] !== 0) continue
    const adaylar = RAKAMLAR.filter((deger) => uygunMu(tahta, i, deger))
    if (adaylar.length < enIyi.adaylar.length || enIyi.index === -1) {
      enIyi = { index: i, adaylar }
      if (adaylar.length <= 1) break
    }
  }
  return enIyi
}

/**
 * Çözüm sayısını sayar; `limit`e ulaşınca erken çıkar (tek çözüm denetimi için).
 * En kısıtlı hücreden ilerlemek, tekliği kanıtlamayı kat kat hızlandırır.
 */
export function cozumSay(tahta: number[], limit = 2): number {
  const { index, adaylar } = enKisitliBos(tahta)
  if (index === -1) return 1
  if (adaylar.length === 0) return 0

  let toplam = 0
  for (const deger of adaylar) {
    tahta[index] = deger
    toplam += cozumSay(tahta, limit - toplam)
    tahta[index] = 0
    if (toplam >= limit) break
  }
  return toplam
}

export class SudokuGame {
  zorluk: Zorluk = VARSAYILAN_ZORLUK
  /** Tam çözüm. */
  cozum: number[] = []
  /** Başlangıçta verilen ipuçları (0 = boş). */
  ipuclari: number[] = []
  /** Oyuncunun girdikleri (0 = boş). İpucu hücreleri burada da doludur. */
  tahta: number[] = []
  /** Hücre başına kalem notları (1-9). Boş hücrelerde anlamlı. */
  notlar: Set<number>[] = []
  hata = 0

  private readonly random: Uretec

  constructor(zorluk: Zorluk = VARSAYILAN_ZORLUK, random: Uretec = Math.random) {
    this.random = random
    this.yeniBulmaca(zorluk)
  }

  get toplam(): number {
    return TOPLAM
  }

  get tamamlandi(): boolean {
    return this.tahta.every((deger, index) => deger === this.cozum[index])
  }

  get kalanBos(): number {
    return this.tahta.filter((deger) => deger === 0).length
  }

  ipucuMu(index: number): boolean {
    return this.ipuclari[index] !== 0
  }

  /** Oyuncunun girdiği ve çözümle uyuşmayan hücre. */
  hataliMi(index: number): boolean {
    const deger = this.tahta[index]
    return deger !== 0 && !this.ipucuMu(index) && deger !== this.cozum[index]
  }

  yeniBulmaca(zorluk: Zorluk = this.zorluk): void {
    this.zorluk = zorluk
    this.hata = 0

    const cozum = Array<number>(TOPLAM).fill(0)
    doldur(cozum, this.random)
    this.cozum = cozum

    const ipuclari = cozum.slice()
    const hedefIpucu = ZORLUKLAR[zorluk].ipucu
    let dolu = TOPLAM

    for (const index of karistir(Array.from({ length: TOPLAM }, (_, i) => i), this.random)) {
      if (dolu <= hedefIpucu) break
      const yedek = ipuclari[index]
      ipuclari[index] = 0
      // Boşaltınca çözüm tekliği bozuluyorsa geri koy.
      if (cozumSay(ipuclari.slice()) !== 1) {
        ipuclari[index] = yedek
        continue
      }
      dolu--
    }

    this.ipuclari = ipuclari
    this.tahta = ipuclari.slice()
    this.notlar = Array.from({ length: TOPLAM }, () => new Set<number>())
  }

  /** Bu hücreye not yazılabilir mi? (boş ve ipucu olmayan) */
  notYazilabilir(index: number): boolean {
    return index >= 0 && index < TOPLAM && !this.ipucuMu(index) && this.tahta[index] === 0
  }

  notVar(index: number, deger: number): boolean {
    return this.notlar[index]?.has(deger) ?? false
  }

  /** Notu ekler ya da kaldırır. Dolu ve ipucu hücrelerde çalışmaz. */
  notDegistir(index: number, deger: number): boolean {
    if (!this.notYazilabilir(index) || deger < 1 || deger > BOYUT) return false
    const kume = this.notlar[index]
    if (kume.has(deger)) kume.delete(deger)
    else kume.add(deger)
    return true
  }

  notlariTemizle(index: number): boolean {
    const kume = this.notlar[index]
    if (!kume || kume.size === 0) return false
    kume.clear()
    return true
  }

  /** Hücreye rakam yazar (0 siler). İpucu hücreleri değiştirilemez. */
  yaz(index: number, deger: number): boolean {
    if (index < 0 || index >= TOPLAM || this.ipucuMu(index)) return false
    if (deger < 0 || deger > BOYUT) return false
    if (this.tahta[index] === deger) return false

    this.tahta[index] = deger
    if (deger !== 0) {
      // Rakam yazılınca o hücrenin notları anlamsız kalır; ayrıca aynı satır,
      // sütun ve kutudaki hücrelerden bu rakamın notu düşer (elle silmek zahmetli).
      this.notlar[index].clear()
      for (let i = 0; i < TOPLAM; i++) {
        if (i !== index && this.iliskiliMi(index, i)) this.notlar[i].delete(deger)
      }
      if (deger !== this.cozum[index]) this.hata++
    }
    return true
  }

  sil(index: number): boolean {
    return this.yaz(index, 0)
  }

  /** Bu hücrenin satır/sütun/kutu arkadaşları (vurgulamak için). */
  iliskiliMi(a: number, b: number): boolean {
    return satirNo(a) === satirNo(b) || sutunNo(a) === sutunNo(b) || kutuNo(a) === kutuNo(b)
  }
}
