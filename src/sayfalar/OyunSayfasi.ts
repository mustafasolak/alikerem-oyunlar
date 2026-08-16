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

export async function oyunSayfasi(id: string): Promise<Temizleyici> {
  const kok = document.querySelector<HTMLDivElement>('#app')
  if (!kok) return () => {}

  const kayit = KATALOG_HARITASI.get(id)
  const yukleyici = yukleyiciBul(id)
  if (!kayit || !yukleyici) {
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
    const { GameScene } = await tanim.sahne()
    if (iptal) return () => {}

    sahneKutusu?.classList.remove('yukleniyor')
    oyun = new Phaser.Game({
      type: Phaser.AUTO,
      parent: 'game',
      width: kayit.tuval.genislik,
      height: kayit.tuval.yukseklik,
      transparent: true,
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      scene: [GameScene as unknown as typeof Phaser.Scene],
    })
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
