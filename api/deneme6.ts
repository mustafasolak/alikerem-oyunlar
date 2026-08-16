/** GEÇİCİ — api içi ama alt çizgisiz dosyadan içe aktarım. */
import { selam } from './deneme-ortak.ts'
export default function handler(_i: unknown, y: { status: (k: number) => { json: (g: unknown) => void } }): void {
  y.status(200).json({ deneme: 6, selam })
}
