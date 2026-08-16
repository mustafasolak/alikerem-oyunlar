/** GET /api/oyunlar — katalogda gizlenecek oyunlar (herkese açık, kısa önbellekli). */
import { hata, type Istek, type Yanit } from './_ortak.js'
import { gizliOyunlar } from './_sorgular.js'
import { sql, veritabaniVar } from './_veritabani.js'

export default async function handler(_istek: Istek, yanit: Yanit): Promise<void> {
  if (!veritabaniVar || !sql) return hata(yanit, 503, 'Veritabanı bağlı değil')
  try {
    const gizli = await gizliOyunlar(sql)
    yanit.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60')
    yanit.status(200).json({ tamam: true, gizli })
  } catch (e) {
    console.error('gizli oyunlar okunamadı', e)
    hata(yanit, 500, 'Okunamadı')
  }
}
