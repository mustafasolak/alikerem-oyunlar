/** GEÇİCİ — uzantısız göreli içe aktarım çalışıyor mu? */
import { selam } from './_yardim'
export default function handler(_i: unknown, y: { status: (k: number) => { json: (g: unknown) => void } }): void {
  y.status(200).json({ deneme: 3, selam })
}
