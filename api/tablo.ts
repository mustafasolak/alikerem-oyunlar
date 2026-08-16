/** GET /api/tablo?oyun=<id>&donem=<etiket>&adet=10 — skor tablosu. */
import { OYUN_ID_KALIBI, donemCoz, hata, uidOku, type Istek, type Yanit } from './_ortak.js'
import { tabloOku } from './_sorgular.js'
import { sql, veritabaniVar } from './_veritabani.js'

const EN_COK = 25

export default async function handler(istek: Istek, yanit: Yanit): Promise<void> {
  if (!veritabaniVar || !sql) return hata(yanit, 503, 'Veritabanı bağlı değil')

  const oyunId = String(istek.query?.oyun ?? '')
  if (!OYUN_ID_KALIBI.test(oyunId)) return hata(yanit, 400, 'Geçersiz oyun')

  const donem = donemCoz(String(istek.query?.donem ?? 'tum'))
  if (!donem) return hata(yanit, 400, 'Geçersiz dönem')

  const adet = Math.min(EN_COK, Math.max(1, Number(istek.query?.adet ?? 10) || 10))

  try {
    const kayitlar = await tabloOku(sql, oyunId, donem, adet, uidOku(istek))
    yanit.setHeader('Cache-Control', 'public, max-age=15, s-maxage=30')
    yanit.status(200).json({ tamam: true, donem, kayitlar })
  } catch (e) {
    console.error('tablo okunamadı', e)
    hata(yanit, 500, 'Okunamadı')
  }
}
