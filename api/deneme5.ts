/** GEÇİCİ — api dışındaki klasörden içe aktarım (.ts uzantılı). */
import { selam } from '../lib/deneme-yardim.ts'
export default function handler(_i: unknown, y: { status: (k: number) => { json: (g: unknown) => void } }): void {
  y.status(200).json({ deneme: 5, selam })
}
