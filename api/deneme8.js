/** GEÇİCİ — düz JS dosyalar arası göreli içe aktarım. */
import { selam } from './deneme-ortak-js.js'
export default function handler(_i, y) {
  y.status(200).json({ deneme: 8, selam })
}
