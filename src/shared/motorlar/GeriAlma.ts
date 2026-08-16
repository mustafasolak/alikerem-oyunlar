/**
 * Kâğıt oyunları için geri alma yığını.
 *
 * Solitaire, Örümcek ve FreeCell durumlarını sade nesne olarak verebiliyor;
 * yığın bunların derin kopyasını tutar. Motorların ortak ihtiyacı olduğu için
 * her birinde ayrı ayrı yazmak yerine burada toplandı.
 *
 * Geri alma bedavaya gelmez: üç oyun da skoru `... - hamle * ceza` diye
 * hesapladığı için, geri alma da bir hamle sayılır (motorlar bunu uygular).
 */

/** Kaç hamle geriye gidilebilir. Elle sayılamayacak kadar uzun bir geçmiş gereksiz. */
export const GERI_ALMA_DERINLIGI = 40

export class GeriAlmaYigini<T> {
  private yigin: T[] = []
  private readonly derinlik: number

  constructor(derinlik: number = GERI_ALMA_DERINLIGI) {
    this.derinlik = derinlik
  }

  get doluMu(): boolean {
    return this.yigin.length > 0
  }

  get adet(): number {
    return this.yigin.length
  }

  /** Hamleden önceki durumu saklar. */
  kaydet(durum: T): void {
    this.yigin.push(structuredClone(durum))
    if (this.yigin.length > this.derinlik) this.yigin.shift()
  }

  /** Son kaydı verir; yığın boşsa null. */
  al(): T | null {
    return this.yigin.pop() ?? null
  }

  temizle(): void {
    this.yigin = []
  }
}
