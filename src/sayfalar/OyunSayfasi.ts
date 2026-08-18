/**
 * Oyun sayfası: kabuğu kurar, oyun modülünü tembel yükler, Phaser örneğini
 * açar ve sayfadan çıkılırken düzgün yıkar.
 */

import * as Phaser from 'phaser'

import '../shared/game-page.css'

import { kabukHtml, temayiTemizle, temayiUygula } from '../cekirdek/OyunKabugu.ts'
import { sonOynananaEkle } from '../cekirdek/tercihler.ts'
import { yukleyiciBul } from '../cekirdek/yukleyiciler.ts'
import type { Temizleyici } from '../cekirdek/yonlendirici.ts'
import { KATALOG_HARITASI } from '../uretilmis/katalog.ts'
import { SITE_BASLIK } from '../cekirdek/site.ts'

/**
 * Tuvalin kaç kat çözünürlükte çizileceği.
 *
 * Geniş ekranda tahta 900px'i geçiyor; 540px'lik tuval o boyda upscale edilince
 * yumuşuyor. Oyunu iki kat büyük tuvalde açıp kamerayı iki kat yakınlaştırınca
 * dünya koordinatları aynı kalıyor (oyun kodu değişmiyor) ama piksel sayısı
 * dört katına çıkıyor. Telefonda tahta zaten küçük, orada 1 kalıyor:
 * gereksiz yere dört kat doldurma maliyeti çıkmasın.
 */
const GENIS_EKRAN_ESIGI = 900
const CIZIM_ORANI = 2

function cizimOrani(): number {
  return window.innerWidth >= GENIS_EKRAN_ESIGI ? CIZIM_ORANI : 1
}

export async function oyunSayfasi(id: string): Promise<Temizleyici> {
  const kok = document.querySelector<HTMLDivElement>('#app')
  if (!kok) return () => {}

  const kayit = KATALOG_HARITASI.get(id)
  const yukleyici = yukleyiciBul(id)

  // Dış bağlantılı oyun: burada sahne kurulmaz, doğrudan kendi adresine gider.
  // (Karta tıklayınca zaten oraya gidiliyor; bu, adresi elle yazan için.)
  if (kayit?.disAdres) {
    window.location.replace(kayit.disAdres)
    return () => {}
  }

  if (!kayit || !yukleyici || !kayit.tuval) {
    kok.innerHTML = `
      <div class="wrap bos-durum">
        <h1>Oyun bulunamadı</h1>
        <p>“${id}” diye bir oyun yok.</p>
        <a class="btn btn--accent" href="#/">Ana sayfaya dön</a>
      </div>`
    return () => {
      kok.innerHTML = ''
    }
  }

  // Kabuk hemen çizilir; sahne kodu arkadan iner. Böylece boş ekran görünmez.
  kok.innerHTML = kabukHtml(kayit)
  temayiUygula(kayit)
  document.title = `${kayit.ad} — ${SITE_BASLIK}`
  sonOynananaEkle(id)

  const sahneKutusu = document.querySelector<HTMLElement>('#game')
  if (sahneKutusu) sahneKutusu.classList.add('yukleniyor')

  let oyun: Phaser.Game | null = null
  let iptal = false

  try {
    const tanim = (await yukleyici()).default
    if (!tanim.sahne) throw new Error(`${id}: sahne yükleyicisi yok`)
    const { GameScene } = await tanim.sahne()
    if (iptal) return () => {}

    sahneKutusu?.classList.remove('yukleniyor')
    const oran = cizimOrani()
    const tuval = kayit.tuval
    oyun = new Phaser.Game({
      type: Phaser.AUTO,
      parent: 'game',
      width: tuval.genislik * oran,
      height: tuval.yukseklik * oran,
      transparent: true,
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      scene: [GameScene as unknown as typeof Phaser.Scene],
    })

    if (oran !== 1) {
      // Kamerayı aynı oranda yakınlaştır: sahneler yine kendi tuval
      // ölçülerine göre çizer, yalnız piksel sayısı artar.
      const kamerayiAyarla = (): void => {
        for (const sahne of oyun?.scene.getScenes(false) ?? []) {
          sahne.cameras.main?.setZoom(oran)
          sahne.cameras.main?.centerOn(tuval.genislik / 2, tuval.yukseklik / 2)
        }
      }
      oyun.events.once(Phaser.Core.Events.READY, kamerayiAyarla)
    }
  } catch (hata) {
    sahneKutusu?.classList.remove('yukleniyor')
    console.error(`Oyun yüklenemedi: ${id}`, hata)
    kok.innerHTML = `
      <div class="wrap bos-durum">
        <h1>Oyun açılamadı</h1>
        <p>Bağlantını kontrol edip tekrar dene.</p>
        <a class="btn btn--accent" href="#/">Ana sayfaya dön</a>
      </div>`
  }

  return () => {
    iptal = true
    // true: tuvali de kaldır — sahne dinleyicileri kabukla birlikte ölür
    oyun?.destroy(true)
    oyun = null
    temayiTemizle()
    kok.innerHTML = ''
    document.title = SITE_BASLIK
  }
}
