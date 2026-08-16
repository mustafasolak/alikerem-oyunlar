/**
 * Katalog (ana) sayfası: arama, kategori süzgeci, favoriler ve son oynananlar.
 *
 * 800 oyunda tek seferde 800 kart basmamak için liste parça parça büyür.
 */

import { KATEGORI_ADLARI, type Kategori, type KatalogKaydi } from '../cekirdek/tanim.ts'
import { favoriDegistir, favoriMi, favoriler, sonOynananlar } from '../cekirdek/tercihler.ts'
import { SITE_ALT_BASLIK, SITE_BASLIK } from '../cekirdek/site.ts'
import { bestEntryOf } from '../shared/Leaderboard.ts'
import { sunucu } from '../shared/Sunucu.ts'
import { KATALOG } from '../uretilmis/katalog.ts'
import type { Temizleyici } from '../cekirdek/yonlendirici.ts'

const SAYFA_ADEDI = 24

const kacir = (s: string): string =>
  s.replace(/[&<>"]/g, (k) => `&${{ '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot' }[k]};`)

/** Türkçe duyarlı, aksan/büyük harf farkını yok sayan arama anahtarı. */
const anahtar = (s: string): string => s.toLocaleLowerCase('tr').replace(/[ıîi̇]/g, 'i')

type Suzgec = 'hepsi' | 'favori' | Kategori

interface Durum {
  arama: string
  suzgec: Suzgec
  gosterilen: number
}

export function katalogSayfasi(): Temizleyici {
  const bulunan = document.querySelector<HTMLDivElement>('#app')
  if (!bulunan) return () => {}
  const kok: HTMLDivElement = bulunan

  document.title = SITE_BASLIK
  const durum: Durum = { arama: '', suzgec: 'hepsi', gosterilen: SAYFA_ADEDI }

  /**
   * Yönetim panelinden gizlenen oyunlar. Sayfa beklemeden çizilir; liste
   * gelirse yeniden çizilir. Sunucu kapalıysa hiçbir oyun gizlenmez.
   */
  let gizli: string[] = []
  let kapandi = false

  const kategoriler = [...new Set(KATALOG.map((o) => o.kategori))].sort((a, b) =>
    KATEGORI_ADLARI[a].localeCompare(KATEGORI_ADLARI[b], 'tr'),
  )

  kok.innerHTML = `
    <div class="wrap">
      <header class="site-header">
        <span class="logo" aria-hidden="true">🎮</span>
        <div>
          <h1>${SITE_BASLIK}</h1>
          <p>${SITE_ALT_BASLIK}</p>
        </div>
      </header>

      <div class="katalog-arac">
        <input id="arama" class="arama" type="search" placeholder="Oyun ara…" autocomplete="off"
          aria-label="Oyun ara" />
        <button class="btn" id="rastgele" type="button">🎲 Rastgele</button>
      </div>

      <div class="suzgec" id="suzgec">
        <button class="btn" type="button" data-suzgec="hepsi" aria-pressed="true">Hepsi</button>
        <button class="btn" type="button" data-suzgec="favori" aria-pressed="false">★ Favoriler</button>
        ${kategoriler
          .map(
            (k) =>
              `<button class="btn" type="button" data-suzgec="${k}" aria-pressed="false">${KATEGORI_ADLARI[k]}</button>`,
          )
          .join('')}
      </div>

      <section id="son-bolum" hidden>
        <div class="section-title"><span>Son oynananlar</span></div>
        <div class="grid" id="son-grid"></div>
      </section>

      <div class="section-title">
        <span id="liste-basligi">Oyunlar</span>
        <span id="liste-sayisi"></span>
      </div>
      <main class="grid" id="grid"></main>
      <div class="daha" id="daha-sarmal" hidden>
        <button class="btn" id="daha" type="button">Daha fazla göster</button>
      </div>

      <footer class="site-footer">
        Klavye ve dokunmatik desteklenir. Skorlar yalnızca bu cihazda saklanır.
      </footer>
    </div>
  `

  const grid = kok.querySelector<HTMLElement>('#grid')!
  const sonBolum = kok.querySelector<HTMLElement>('#son-bolum')!
  const sonGrid = kok.querySelector<HTMLElement>('#son-grid')!
  const listeSayisi = kok.querySelector<HTMLElement>('#liste-sayisi')!
  const listeBasligi = kok.querySelector<HTMLElement>('#liste-basligi')!
  const daharSarmal = kok.querySelector<HTMLElement>('#daha-sarmal')!

  function suzulmus(): KatalogKaydi[] {
    const a = anahtar(durum.arama.trim())
    const fav = favoriler()
    return KATALOG.filter((o) => {
      if (gizli.includes(o.id)) return false
      if (durum.suzgec === 'favori' && !fav.includes(o.id)) return false
      if (durum.suzgec !== 'hepsi' && durum.suzgec !== 'favori' && o.kategori !== durum.suzgec) return false
      if (!a) return true
      return (
        anahtar(o.ad).includes(a) ||
        anahtar(o.ozet).includes(a) ||
        o.etiketler.some((e) => anahtar(e).includes(a))
      )
    })
  }

  function kart(o: KatalogKaydi): string {
    const enIyi = bestEntryOf(o.id)
    const rekor = enIyi
      ? `<span class="record"><span aria-hidden="true">🏆</span> ${kacir(enIyi.name)} · ${enIyi.score}</span>`
      : '<span class="record record--empty">Henüz skor yok</span>'
    const fav = favoriMi(o.id)
    return `
      <div class="card-sarmal">
        <a class="card" href="#/oyun/${o.id}">
          <div class="card-art" aria-hidden="true">${o.emoji}</div>
          <h2>${kacir(o.ad)}</h2>
          <p>${kacir(o.ozet)}</p>
          <ul class="tags">${o.etiketler.map((e) => `<li>${kacir(e)}</li>`).join('')}</ul>
          <div class="card-foot">${rekor}<span class="go">Oyna →</span></div>
        </a>
        <button class="favori ${fav ? 'is-on' : ''}" type="button" data-favori="${o.id}"
          aria-label="${fav ? 'Favorilerden çıkar' : 'Favorilere ekle'}">${fav ? '★' : '☆'}</button>
      </div>`
  }

  function ciz(): void {
    const liste = suzulmus()
    const gosterilecek = liste.slice(0, durum.gosterilen)
    grid.innerHTML = gosterilecek.map(kart).join('')
    listeSayisi.textContent = `${liste.length} oyun`
    listeBasligi.textContent =
      durum.suzgec === 'hepsi' ? 'Oyunlar' : durum.suzgec === 'favori' ? 'Favoriler' : KATEGORI_ADLARI[durum.suzgec]
    daharSarmal.hidden = liste.length <= durum.gosterilen

    if (liste.length === 0) {
      grid.innerHTML = `<p class="bos-liste">Aramana uyan oyun yok.</p>`
    }

    // Son oynananlar yalnız süzgeçsiz ve aramasız görünsün
    const son = sonOynananlar()
      .map((id) => KATALOG.find((o) => o.id === id))
      .filter((o): o is KatalogKaydi => Boolean(o))
    const gosterSon = son.length > 0 && durum.suzgec === 'hepsi' && durum.arama.trim() === ''
    sonBolum.hidden = !gosterSon
    if (gosterSon) sonGrid.innerHTML = son.slice(0, 4).map(kart).join('')
  }

  function suzgecSec(deger: Suzgec): void {
    durum.suzgec = deger
    durum.gosterilen = SAYFA_ADEDI
    for (const b of kok.querySelectorAll<HTMLButtonElement>('#suzgec button')) {
      b.setAttribute('aria-pressed', String(b.dataset.suzgec === deger))
    }
    ciz()
  }

  const aramaKutusu = kok.querySelector<HTMLInputElement>('#arama')!
  aramaKutusu.addEventListener('input', () => {
    durum.arama = aramaKutusu.value
    durum.gosterilen = SAYFA_ADEDI
    ciz()
  })

  kok.querySelector('#suzgec')!.addEventListener('click', (olay) => {
    const hedef = (olay.target as HTMLElement).closest<HTMLButtonElement>('button[data-suzgec]')
    if (hedef?.dataset.suzgec) suzgecSec(hedef.dataset.suzgec as Suzgec)
  })

  kok.querySelector('#daha')!.addEventListener('click', () => {
    durum.gosterilen += SAYFA_ADEDI
    ciz()
  })

  kok.querySelector('#rastgele')!.addEventListener('click', () => {
    const liste = suzulmus()
    if (liste.length === 0) return
    location.hash = `#/oyun/${liste[Math.floor(Math.random() * liste.length)].id}`
  })

  // Favori düğmeleri kartların içinde; olayı üstte yakalıyoruz
  kok.addEventListener('click', (olay) => {
    const hedef = (olay.target as HTMLElement).closest<HTMLButtonElement>('button[data-favori]')
    if (!hedef?.dataset.favori) return
    olay.preventDefault()
    favoriDegistir(hedef.dataset.favori)
    ciz()
  })

  ciz()

  // Gizli oyun listesi arka planda gelsin; sayfa onu beklemesin
  void sunucu.gizliOyunlar().then((liste) => {
    if (kapandi || liste.length === 0) return
    gizli = liste
    ciz()
  })

  return () => {
    kapandi = true
    kok.innerHTML = ''
  }
}
