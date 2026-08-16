/**
 * İskambil temelleri — Solitaire, Spider ve FreeCell bunu paylaşır.
 * Kart: 1 (as) – 13 (şah), dört renk.
 */

import { karistir, type Uretec } from '../rastgele.ts'

export type Renk = 'maca' | 'kupa' | 'karo' | 'sinek'

export interface Kart {
  deger: number
  renk: Renk
  acik: boolean
}

export const RENKLER: Renk[] = ['maca', 'kupa', 'karo', 'sinek']
export const RENK_SIMGELERI: Record<Renk, string> = { maca: '♠', kupa: '♥', karo: '♦', sinek: '♣' }
/** Kupa ve karo kırmızı; sıralamada renk değişimi bunlara bakar. */
export const KIRMIZI: Renk[] = ['kupa', 'karo']

export const DEGER_YAZISI = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

export const kirmiziMi = (renk: Renk): boolean => KIRMIZI.includes(renk)

export function kartYazisi(kart: Kart): string {
  return `${DEGER_YAZISI[kart.deger]}${RENK_SIMGELERI[kart.renk]}`
}

/** `desteSayisi` deste, istenirse tek renkten. */
export function desteYap(desteSayisi: number, renkler: Renk[], random: Uretec = Math.random): Kart[] {
  const kartlar: Kart[] = []
  for (let d = 0; d < desteSayisi; d++) {
    for (const renk of renkler) {
      for (let deger = 1; deger <= 13; deger++) {
        kartlar.push({ deger, renk, acik: false })
      }
    }
  }
  return karistir(kartlar, random)
}

/** Klondike/FreeCell sırası: bir küçük ve ters renk. */
export function uzerineKonurMu(ust: Kart, alt: Kart): boolean {
  return ust.deger === alt.deger - 1 && kirmiziMi(ust.renk) !== kirmiziMi(alt.renk)
}

/** Spider sırası: aynı renkten bir küçük. */
export function ayniRenkSira(ust: Kart, alt: Kart): boolean {
  return ust.deger === alt.deger - 1 && ust.renk === alt.renk
}
