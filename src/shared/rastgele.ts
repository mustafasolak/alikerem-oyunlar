/** Rastgelelik yardımcıları. Üreteç dışarıdan verilebilir, böylece testler kestirilebilir olur. */

export type Uretec = () => number

export function tamsayi(max: number, random: Uretec = Math.random): number {
  return Math.floor(random() * max)
}

export function birSec<T>(list: readonly T[], random: Uretec = Math.random): T {
  return list[tamsayi(list.length, random)]
}

/** Fisher-Yates; kaynağı bozmaz. */
export function karistir<T>(list: readonly T[], random: Uretec = Math.random): T[] {
  const copy = list.slice()
  for (let i = copy.length - 1; i > 0; i--) {
    const j = tamsayi(i + 1, random)
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/** Listeden tekrarsız n eleman seçer (n listeden büyükse hepsini verir). */
export function nTaneSec<T>(list: readonly T[], n: number, random: Uretec = Math.random): T[] {
  return karistir(list, random).slice(0, Math.min(n, list.length))
}
