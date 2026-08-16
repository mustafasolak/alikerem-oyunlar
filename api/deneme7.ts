/** GEÇİCİ — ESM'in beklediği .js belirteci (kaynak .ts). */
import { selam } from './deneme-ortak.js'
export default function handler(_i: unknown, y: { status: (k: number) => { json: (g: unknown) => void } }): void {
  y.status(200).json({ deneme: 7, selam })
}
