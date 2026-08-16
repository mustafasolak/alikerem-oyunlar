/** GEÇİCİ — .ts uzantılı göreli içe aktarım çalışıyor mu? */
import { selam } from './_yardim.ts'
export default function handler(_i: unknown, y: { status: (k: number) => { json: (g: unknown) => void } }): void {
  y.status(200).json({ deneme: 2, selam })
}
