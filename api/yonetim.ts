/**
 * /api/yonetim — yönetim paneli ucu.
 *
 * GET  : oyun listesi, özet ve son gönderimler (yönetici çerezi ister)
 * POST : { islem: 'giris' | 'cikis' | 'oyun' | 'skorSil' }
 *
 * Panel `YONETIM_PAROLASI` tanımlı değilse hiç açılmaz — kaza eseri
 * korumasız bir panel yayında kalmasın.
 */
import {
  OYUN_ID_KALIBI,
  govdeOku,
  hata,
  yonetimAcik,
  yonetimCikisi,
  yonetimGirisi,
  yoneticiMi,
  type Istek,
  type Yanit,
} from './_ortak.js'
import {
  VARSAYILAN_UST_SINIR,
  gunlukHareket,
  oyunAyarla,
  ozet,
  skorlariSil,
  sonSkorlar,
  vitriniAyarla,
  yonetimOyunlari,
} from './_sorgular.js'
import { sql, veritabaniVar } from './_veritabani.js'

/** Denetim listesinde gösterilecek en fazla kayıt. */
const SON_SKOR_ADEDI = 60
/** Vitrinde en fazla bu kadar oyun durabilir; ana sayfa bir şerit kalsın. */
const VITRIN_SINIRI = 12
/** Yanlış parolada beklenen süre: deneme yanılmayı yavaşlatır. */
const YANLIS_PAROLA_GECIKMESI_MS = 500

const bekle = (ms: number): Promise<void> => new Promise((coz) => setTimeout(coz, ms))

export default async function handler(istek: Istek, yanit: Yanit): Promise<void> {
  yanit.setHeader('Cache-Control', 'no-store')
  if (!yonetimAcik) return hata(yanit, 503, 'Yönetim paneli kapalı (YONETIM_PAROLASI tanımlı değil)')
  if (!veritabaniVar || !sql) return hata(yanit, 503, 'Veritabanı bağlı değil')

  if (istek.method === 'POST') {
    const govde = govdeOku(istek)
    const islem = typeof govde.islem === 'string' ? govde.islem : ''

    if (islem === 'giris') {
      if (!yonetimGirisi(govde.parola, yanit)) {
        await bekle(YANLIS_PAROLA_GECIKMESI_MS)
        return hata(yanit, 401, 'Parola yanlış')
      }
      return yanit.status(200).json({ tamam: true })
    }

    if (islem === 'cikis') {
      yonetimCikisi(yanit)
      return yanit.status(200).json({ tamam: true })
    }

    if (!yoneticiMi(istek)) return hata(yanit, 401, 'Giriş gerekli')

    try {
      if (islem === 'oyun') {
        const oyunId = typeof govde.oyunId === 'string' ? govde.oyunId : ''
        if (!OYUN_ID_KALIBI.test(oyunId)) return hata(yanit, 400, 'Geçersiz oyun')

        const ustSinir = Number(govde.ustSinir)
        if (!Number.isInteger(ustSinir) || ustSinir < 1) return hata(yanit, 400, 'Geçersiz üst sınır')

        const oneCikanHam = Number(govde.oneCikan)
        const oneCikan = Number.isInteger(oneCikanHam) && oneCikanHam > 0 ? oneCikanHam : null

        await oyunAyarla(sql, oyunId, Boolean(govde.gizli), oneCikan, ustSinir)
        return yanit.status(200).json({ tamam: true })
      }

      if (islem === 'vitrin') {
        const ham = Array.isArray(govde.kimlikler) ? govde.kimlikler : null
        if (!ham) return hata(yanit, 400, 'Vitrin listesi bekleniyor')
        if (ham.length > VITRIN_SINIRI) return hata(yanit, 400, 'Vitrin fazla kalabalık')

        const kimlikler: string[] = []
        for (const d of ham) {
          if (typeof d !== 'string' || !OYUN_ID_KALIBI.test(d)) return hata(yanit, 400, 'Geçersiz oyun')
          if (!kimlikler.includes(d)) kimlikler.push(d)
        }
        await vitriniAyarla(sql, kimlikler)
        return yanit.status(200).json({ tamam: true, kimlikler })
      }

      if (islem === 'skorSil') {
        const oyunId = typeof govde.oyunId === 'string' ? govde.oyunId : ''
        const uid = typeof govde.uid === 'string' ? govde.uid : ''
        if (!OYUN_ID_KALIBI.test(oyunId) || uid.length === 0) return hata(yanit, 400, 'Geçersiz kayıt')
        const silinen = await skorlariSil(sql, oyunId, uid)
        return yanit.status(200).json({ tamam: true, silinen })
      }
    } catch (e) {
      console.error('yönetim işlemi başarısız', e)
      return hata(yanit, 500, 'İşlem yapılamadı')
    }

    return hata(yanit, 400, 'Bilinmeyen işlem')
  }

  if (!yoneticiMi(istek)) return hata(yanit, 401, 'Giriş gerekli')

  try {
    const [oyunlar, toplam, hareket, skorlar] = await Promise.all([
      yonetimOyunlari(sql),
      ozet(sql),
      gunlukHareket(sql),
      sonSkorlar(sql, SON_SKOR_ADEDI),
    ])
    yanit.status(200).json({
      tamam: true,
      oyunlar,
      ozet: toplam,
      hareket,
      skorlar,
      // İstemci, veritabanında satırı olmayan oyunlar için bunu kullanır
      varsayilanUstSinir: VARSAYILAN_UST_SINIR,
    })
  } catch (e) {
    console.error('yönetim verisi okunamadı', e)
    hata(yanit, 500, 'Okunamadı')
  }
}
