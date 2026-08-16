/**
 * POST /api/skor — skor gönderimi.
 *
 * Seviye 1 doğrulama: sınır, süre tutarlılığı ve hız kısıtı. Dönem etiketleri
 * sunucu saatinden üretilir. (Seviye 2 — hamleleri yeniden oynatarak doğrulama —
 * sonraki aşamada eklenecek; `dogrulandi` sütunu bunun için hazır duruyor.)
 */
import {
  OYUN_ID_KALIBI,
  adTemizle,
  donemler,
  govdeOku,
  hata,
  uidOku,
  type Istek,
  type Yanit,
} from './_ortak.js'
import { PENCERE_SINIRI, gonderimSay, oyunAyari, skorYaz } from './_sorgular.js'
import { sql, veritabaniVar } from './_veritabani.js'

/** Süre bilgisi verilmişse en az bu kadar sürmüş olmalı. */
const EN_KISA_TUR_SN = 2

export default async function handler(istek: Istek, yanit: Yanit): Promise<void> {
  if (istek.method !== 'POST') return hata(yanit, 405, 'POST bekleniyor')
  if (!veritabaniVar || !sql) return hata(yanit, 503, 'Veritabanı bağlı değil')

  const uid = uidOku(istek)
  if (!uid) return hata(yanit, 401, 'Kimlik yok')

  const govde = govdeOku(istek)
  const oyunId = typeof govde.oyunId === 'string' ? govde.oyunId : ''
  const skor = Number(govde.skor)
  const sure = Number(govde.sure)
  const ad = adTemizle(govde.ad)

  if (!OYUN_ID_KALIBI.test(oyunId)) return hata(yanit, 400, 'Geçersiz oyun')
  if (!Number.isInteger(skor) || skor <= 0) return hata(yanit, 400, 'Geçersiz skor')
  if (Number.isFinite(sure) && sure > 0 && sure < EN_KISA_TUR_SN) {
    return hata(yanit, 400, 'Tur çok kısa')
  }

  try {
    const oyun = await oyunAyari(sql, oyunId)
    if (oyun.gizli) return hata(yanit, 403, 'Oyun kapalı')
    if (skor > oyun.ustSinir) return hata(yanit, 400, 'Skor sınırın üstünde')

    if ((await gonderimSay(sql, uid, ad)) > PENCERE_SINIRI) {
      return hata(yanit, 429, 'Çok sık gönderim')
    }

    const sureSn = Number.isFinite(sure) && sure > 0 ? Math.round(sure) : null
    const donemListesi = donemler()
    let yazildi = false
    for (const donem of donemListesi) {
      if (await skorYaz(sql, oyunId, uid, donem, ad, skor, sureSn)) yazildi = true
    }

    yanit.status(200).json({ tamam: true, yazildi, donemler: donemListesi })
  } catch (e) {
    console.error('skor yazılamadı', e)
    hata(yanit, 500, 'Kaydedilemedi')
  }
}
