/**
 * Yönetim paneli (#/yonetim).
 *
 * Sunucu tarafı `YONETIM_PAROLASI` tanımlı değilse ucu hiç açmaz; bu sayfa da
 * o durumda giriş yapamaz. Panel tembel yüklenir, normal ziyaretçi indirmez.
 *
 * Kullanıcıdan gelen bütün metin `textContent` ile yazılır — takma adlar
 * denetim listesinde göründüğü için bu şart.
 */

import { SITE_BASLIK } from '../cekirdek/site.ts'
import { sunucu } from '../shared/Sunucu.ts'
import { KATALOG } from '../uretilmis/katalog.ts'
import type { Temizleyici } from '../cekirdek/yonlendirici.ts'

import '../shared/yonetim.css'

interface YonetimOyun {
  id: string
  gizli: boolean
  oneCikan: number | null
  ustSinir: number
  kayit: number
  oyuncu: number
  enYuksek: number
  sonKayit: string | null
}

interface DenetimKaydi {
  oyunId: string
  uid: string
  ad: string
  skor: number
  donem: string
  zaman: string
}

interface YonetimVerisi {
  oyunlar: YonetimOyun[]
  ozet: { oyuncu: number; kimlik: number; kayit: number; oyun: number }
  hareket: { gun: string; adet: number }[]
  skorlar: DenetimKaydi[]
  varsayilanUstSinir: number
}

/** Katalogdaki ad; veritabanında olmayan oyunlar için kimlik gösterilir. */
const OYUN_ADI = new Map(KATALOG.map((o) => [o.id, o.ad]))
const adiniAl = (id: string): string => OYUN_ADI.get(id) ?? id

/**
 * Panelde katalogdaki bütün oyunlar görünmeli — henüz oynanmamış bir oyunu da
 * gizleyebilmek gerekir. Veritabanı yalnız ayarı ya da skoru olan oyunlar için
 * satır tutuyor; eksikler varsayılanla tamamlanır.
 *
 * Sıralama: önce hareketli oyunlar (kayıt sayısına göre), sonra ada göre.
 */
function oyunlariBirlestir(veri: YonetimVerisi): YonetimOyun[] {
  const veritabani = new Map(veri.oyunlar.map((o) => [o.id, o]))
  const kimlikler = new Set([...OYUN_ADI.keys(), ...veritabani.keys()])

  const hepsi = [...kimlikler].map(
    (id) =>
      veritabani.get(id) ?? {
        id,
        gizli: false,
        oneCikan: null,
        ustSinir: veri.varsayilanUstSinir,
        kayit: 0,
        oyuncu: 0,
        enYuksek: 0,
        sonKayit: null,
      },
  )

  return hepsi.sort(
    (a, b) => b.kayit - a.kayit || adiniAl(a.id).localeCompare(adiniAl(b.id), 'tr'),
  )
}

/**
 * Sunucu yalnız kayıt olan günleri döner. Grafik hep 14 sütun göstersin:
 * boş günler görünmezse tek günlük veri bütün genişliği kaplıyor.
 */
function sonOnDortGun(hareket: { gun: string; adet: number }[]): { gun: string; adet: number }[] {
  const sayilar = new Map(hareket.map((h) => [h.gun, h.adet]))
  const bugun = new Date()
  const gunler: { gun: string; adet: number }[] = []
  for (let geri = 13; geri >= 0; geri--) {
    const t = new Date(bugun)
    t.setDate(t.getDate() - geri)
    // Türkiye takvim günü (sunucu da bu bölgeye göre grupluyor)
    const anahtar = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Istanbul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(t)
    gunler.push({ gun: anahtar, adet: sayilar.get(anahtar) ?? 0 })
  }
  return gunler
}

const tarih = (iso: string | null): string =>
  iso ? new Date(iso).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }) : '—'

function el<K extends keyof HTMLElementTagNameMap>(
  etiket: K,
  sinif?: string,
  yazi?: string,
): HTMLElementTagNameMap[K] {
  const dugum = document.createElement(etiket)
  if (sinif) dugum.className = sinif
  if (yazi !== undefined) dugum.textContent = yazi
  return dugum
}

export async function yonetimSayfasi(): Promise<Temizleyici> {
  document.title = `Yönetim · ${SITE_BASLIK}`
  const kok = document.getElementById('app')
  if (!kok) return () => {}

  const kabuk = el('div', 'yonetim')
  kok.replaceChildren(kabuk)

  const cizGiris = (mesaj?: string): void => {
    kabuk.replaceChildren()
    const kart = el('section', 'yonetim-giris')
    kart.append(el('h1', undefined, 'Yönetim paneli'))

    const form = el('form', 'yonetim-giris-form')
    const alan = el('input')
    alan.type = 'password'
    alan.placeholder = 'Parola'
    alan.autocomplete = 'current-password'
    alan.required = true

    const dugme = el('button', 'btn btn--accent', 'Gir')
    dugme.type = 'submit'

    const uyari = el('p', 'yonetim-uyari')
    if (mesaj) uyari.textContent = mesaj
    else uyari.hidden = true

    form.append(alan, dugme)
    kart.append(form, uyari)

    const geri = el('a', 'yonetim-geri', '← Ana sayfa')
    geri.href = '#/'
    kart.append(geri)
    kabuk.append(kart)
    alan.focus()

    form.addEventListener('submit', (olay) => {
      olay.preventDefault()
      dugme.disabled = true
      uyari.hidden = true
      void (async () => {
        const yanit = await sunucu.yonetim({
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ islem: 'giris', parola: alan.value }),
        })
        dugme.disabled = false
        if (yanit?.ok) {
          void yukle()
          return
        }
        const govde = (await yanit?.json().catch(() => null)) as { mesaj?: string } | null
        cizGiris(govde?.mesaj ?? 'Girilemedi — sunucuya ulaşılamıyor olabilir.')
      })()
    })
  }

  const yukle = async (): Promise<void> => {
    kabuk.replaceChildren(el('p', 'yonetim-bilgi', 'Yükleniyor…'))
    const yanit = await sunucu.yonetim()
    if (yanit?.status === 401) return cizGiris()
    if (!yanit?.ok) {
      const govde = (await yanit?.json().catch(() => null)) as { mesaj?: string } | null
      return cizGiris(govde?.mesaj ?? 'Sunucuya ulaşılamadı.')
    }
    const veri = (await yanit.json()) as YonetimVerisi
    // Vitrin sırası tek yerden yönetilir; tablo işaretleri de buna bakar
    vitrinSirasi = veri.oyunlar
      .filter((o) => o.oneCikan !== null)
      .sort((a, b) => (a.oneCikan ?? 0) - (b.oneCikan ?? 0))
      .map((o) => o.id)
    cizPanel(veri)
  }

  const kaydet = async (govde: Record<string, unknown>): Promise<boolean> => {
    const yanit = await sunucu.yonetim({
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(govde),
    })
    return Boolean(yanit?.ok)
  }

  /** Panelin o anki vitrin sırası; her değişiklikte sunucuya bütünüyle yazılır. */
  let vitrinSirasi: string[] = []
  let sonVeri: YonetimVerisi | null = null

  const vitriniYaz = async (kimlikler: string[]): Promise<void> => {
    if (!(await kaydet({ islem: 'vitrin', kimlikler }))) return
    vitrinSirasi = kimlikler
    if (sonVeri) cizPanel(sonVeri)
  }

  function cizPanel(veri: YonetimVerisi): void {
    sonVeri = veri
    kabuk.replaceChildren()

    // --- Üst bar ---
    const ust = el('header', 'yonetim-ust')
    ust.append(el('h1', undefined, 'Yönetim paneli'))
    const araclar = el('div', 'yonetim-araclar')
    const anaSayfa = el('a', 'btn', 'Ana sayfa')
    anaSayfa.href = '#/'
    const cikis = el('button', 'btn', 'Çıkış')
    cikis.type = 'button'
    cikis.addEventListener('click', () => {
      void kaydet({ islem: 'cikis' }).then(() => cizGiris())
    })
    araclar.append(anaSayfa, cikis)
    ust.append(araclar)
    kabuk.append(ust)

    // --- Özet ---
    const ozet = el('section', 'yonetim-ozet')
    const kutular: [string, number][] = [
      ['Skor gönderen', veri.ozet.oyuncu],
      ['Skor kaydı', veri.ozet.kayit],
      ['Oynanan oyun', veri.ozet.oyun],
      ['Siteye giren', veri.ozet.kimlik],
    ]
    for (const [etiket, deger] of kutular) {
      const kutu = el('div', 'yonetim-kutu')
      kutu.append(el('span', undefined, etiket), el('strong', undefined, String(deger)))
      ozet.append(kutu)
    }
    kabuk.append(ozet)

    // --- Son 14 gün ---
    {
      const gunler = sonOnDortGun(veri.hareket)
      const bolum = el('section', 'yonetim-bolum')
      bolum.append(el('h2', undefined, 'Son 14 gün'))
      const grafik = el('div', 'yonetim-grafik')
      const enCok = Math.max(...gunler.map((g) => g.adet), 1)
      for (const gun of gunler) {
        const sutun = el('div', 'yonetim-sutun')
        sutun.title = `${gun.gun}: ${gun.adet} kayıt`
        const cubuk = el('div', 'yonetim-cubuk')
        cubuk.style.height = `${Math.round((gun.adet / enCok) * 100)}%`
        sutun.append(cubuk, el('span', undefined, gun.gun.slice(8)))
        grafik.append(sutun)
      }
      bolum.append(grafik)
      kabuk.append(bolum)
    }

    // --- Oyunlar ---
    // --- Vitrin ---
    {
      const bolum = el('section', 'yonetim-bolum')
      const ust = el('div', 'yonetim-bolum-ust')
      ust.append(el('h2', undefined, `⭐ Ana sayfa vitrini (${vitrinSirasi.length})`))
      bolum.append(ust)

      if (vitrinSirasi.length === 0) {
        bolum.append(
          el(
            'p',
            'yonetim-bilgi',
            'Vitrin boş. Aşağıdaki listeden bir oyunun “Vitrin” kutusunu işaretle; ana sayfanın en üstünde görünür.',
          ),
        )
      } else {
        const liste = el('ol', 'yonetim-vitrin')
        vitrinSirasi.forEach((id, sira) => {
          const satir = el('li')
          satir.append(el('span', 'yonetim-vitrin-ad', adiniAl(id)))

          const dugmeler = el('div', 'yonetim-vitrin-araclar')
          const yukari = el('button', 'btn', '↑')
          yukari.type = 'button'
          yukari.title = 'Yukarı taşı'
          yukari.disabled = sira === 0
          yukari.addEventListener('click', () => {
            const yeni = [...vitrinSirasi]
            ;[yeni[sira - 1], yeni[sira]] = [yeni[sira], yeni[sira - 1]]
            void vitriniYaz(yeni)
          })

          const asagi = el('button', 'btn', '↓')
          asagi.type = 'button'
          asagi.title = 'Aşağı taşı'
          asagi.disabled = sira === vitrinSirasi.length - 1
          asagi.addEventListener('click', () => {
            const yeni = [...vitrinSirasi]
            ;[yeni[sira], yeni[sira + 1]] = [yeni[sira + 1], yeni[sira]]
            void vitriniYaz(yeni)
          })

          const cikar = el('button', 'btn btn--tehlike', 'Çıkar')
          cikar.type = 'button'
          cikar.addEventListener('click', () => {
            void vitriniYaz(vitrinSirasi.filter((x) => x !== id))
          })

          dugmeler.append(yukari, asagi, cikar)
          satir.append(dugmeler)
          liste.append(satir)
        })
        bolum.append(liste)
      }
      kabuk.append(bolum)
    }

    const oyunListesi = oyunlariBirlestir(veri)
    const oyunBolum = el('section', 'yonetim-bolum')

    const baslikSatiri = el('div', 'yonetim-bolum-ust')
    baslikSatiri.append(el('h2', undefined, `Oyunlar (${oyunListesi.length})`))
    const ara = el('input', 'yonetim-ara')
    ara.type = 'search'
    ara.placeholder = 'Oyun ara…'
    ara.setAttribute('aria-label', 'Oyun ara')
    baslikSatiri.append(ara)
    oyunBolum.append(baslikSatiri)
    if (oyunListesi.length === 0) {
      oyunBolum.append(el('p', 'yonetim-bilgi', 'Katalog boş.'))
    } else {
      const sarmal = el('div', 'yonetim-tablo-sarmal')
      const tablo = el('table', 'yonetim-tablo')
      const bas = el('thead')
      const basSatir = el('tr')
      for (const ad of ['Oyun', 'Gizli', 'Vitrin', 'Skor sınırı', 'Kayıt', 'Oyuncu', 'En yüksek', 'Son']) {
        basSatir.append(el('th', undefined, ad))
      }
      bas.append(basSatir)
      const govde = el('tbody')

      for (const oyun of oyunListesi) {
        const satir = el('tr')
        satir.append(el('td', 'yonetim-ad', adiniAl(oyun.id)))

        const gizliHucre = el('td')
        const gizliKutu = el('input')
        gizliKutu.type = 'checkbox'
        gizliKutu.checked = oyun.gizli
        gizliHucre.append(gizliKutu)

        const oneHucre = el('td')
        const vitrinKutu = el('input')
        vitrinKutu.type = 'checkbox'
        vitrinKutu.checked = vitrinSirasi.includes(oyun.id)
        vitrinKutu.title = 'Ana sayfada öne çıkar'
        oneHucre.append(vitrinKutu)

        const sinirHucre = el('td')
        const sinirAlan = el('input', 'yonetim-sayi')
        sinirAlan.type = 'number'
        sinirAlan.min = '1'
        sinirAlan.value = String(oyun.ustSinir)
        sinirHucre.append(sinirAlan)

        satir.append(gizliHucre, oneHucre, sinirHucre)
        satir.append(
          el('td', undefined, String(oyun.kayit)),
          el('td', undefined, String(oyun.oyuncu)),
          el('td', undefined, String(oyun.enYuksek)),
          el('td', 'yonetim-tarih', tarih(oyun.sonKayit)),
        )

        const uygula = (): void => {
          satir.classList.add('is-kaydediliyor')
          void kaydet({
            islem: 'oyun',
            oyunId: oyun.id,
            gizli: gizliKutu.checked,
            oneCikan: vitrinSirasi.includes(oyun.id) ? vitrinSirasi.indexOf(oyun.id) + 1 : null,
            ustSinir: Number(sinirAlan.value),
          }).then((oldu) => {
            satir.classList.remove('is-kaydediliyor')
            satir.classList.toggle('is-hata', !oldu)
          })
        }
        gizliKutu.addEventListener('change', uygula)
        sinirAlan.addEventListener('change', uygula)

        // Vitrin işareti bütün sırayı yeniden yazar; tek tek sayı girmek yerine
        vitrinKutu.addEventListener('change', () => {
          const yeni = vitrinKutu.checked
            ? [...vitrinSirasi, oyun.id]
            : vitrinSirasi.filter((id) => id !== oyun.id)
          void vitriniYaz(yeni)
        })

        govde.append(satir)
      }
      tablo.append(bas, govde)
      sarmal.append(tablo)
      oyunBolum.append(sarmal)

      // Türkçe duyarsız arama: büyük/küçük ve i/ı farkı takılmasın
      const anahtar = (metin: string): string =>
        metin.toLocaleLowerCase('tr').replaceAll('ı', 'i').replaceAll('İ', 'i')
      ara.addEventListener('input', () => {
        const q = anahtar(ara.value.trim())
        for (const satir of govde.children) {
          const ad = satir.querySelector('.yonetim-ad')?.textContent ?? ''
          ;(satir as HTMLElement).hidden = q !== '' && !anahtar(ad).includes(q)
        }
      })
    }
    kabuk.append(oyunBolum)

    // --- Skor denetimi ---
    const skorBolum = el('section', 'yonetim-bolum')
    skorBolum.append(el('h2', undefined, 'Son gönderimler'))
    if (veri.skorlar.length === 0) {
      skorBolum.append(el('p', 'yonetim-bilgi', 'Henüz skor gönderilmemiş.'))
    } else {
      // Aynı oyuncunun dört dönem kaydı tek satır olarak gösterilsin
      const benzersiz = new Map<string, DenetimKaydi>()
      for (const kayit of veri.skorlar) {
        const anahtar = `${kayit.oyunId}|${kayit.uid}`
        if (!benzersiz.has(anahtar)) benzersiz.set(anahtar, kayit)
      }

      const liste = el('ul', 'yonetim-skorlar')
      for (const kayit of benzersiz.values()) {
        const satir = el('li')
        const bilgi = el('div', 'yonetim-skor-bilgi')
        bilgi.append(
          el('strong', undefined, kayit.ad),
          el('span', undefined, `${adiniAl(kayit.oyunId)} · ${kayit.skor} puan · ${tarih(kayit.zaman)}`),
        )
        const sil = el('button', 'btn btn--tehlike', 'Sil')
        sil.type = 'button'
        sil.addEventListener('click', () => {
          sil.disabled = true
          void kaydet({ islem: 'skorSil', oyunId: kayit.oyunId, uid: kayit.uid }).then((oldu) => {
            if (oldu) satir.remove()
            else sil.disabled = false
          })
        })
        satir.append(bilgi, sil)
        liste.append(satir)
      }
      skorBolum.append(liste)
    }
    kabuk.append(skorBolum)
  }

  await yukle()
  return () => {
    document.title = SITE_BASLIK
    kok.replaceChildren()
  }
}
