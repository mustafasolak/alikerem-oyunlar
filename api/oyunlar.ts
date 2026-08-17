/** GET /api/oyunlar — katalog ayarları: gizlenenler ve vitrin sırası (herkese açık). */
import { hata, type Istek, type Yanit } from './_ortak.js'
import { gizliOyunlar, vitrinOyunlari } from './_sorgular.js'
import { sql, veritabaniVar } from './_veritabani.js'

export default async function handler(_istek: Istek, yanit: Yanit): Promise<void> {
  if (!veritabaniVar || !sql) return hata(yanit, 503, 'Veritabanı bağlı değil')
  try {
    const [gizli, vitrin] = await Promise.all([gizliOyunlar(sql), vitrinOyunlari(sql)])
    yanit.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60')
    yanit.status(200).json({ tamam: true, gizli, vitrin })
  } catch (e) {
    console.error('katalog ayarları okunamadı', e)
    hata(yanit, 500, 'Okunamadı')
  }
}
