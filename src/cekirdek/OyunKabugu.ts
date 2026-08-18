/**
 * Oyun sayfası kabuğu.
 *
 * Bütün oyunların ortak arayüzü (üst bar, skor kutuları, rozetler, araç çubuğu,
 * tuval, sonuç katmanı, tuş takımı, paneller, ipucu, skor tablosu) burada tek
 * yerde üretilir. Oyunlar yalnızca `arayuz` bildirimini verir.
 *
 * Mevcut GameHud / ScoreRecorder / KeyPad / dom.ts kodu bu id'leri arar;
 * kabuk onları sahne kurulmadan önce hazır eder.
 */

import type { Arayuz, KatalogKaydi } from './tanim.ts'

const kacir = (s: string): string =>
  s.replace(/[&<>"]/g, (k) => `&${{ '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot' }[k]};`)

function rozetler(arayuz?: Arayuz): string {
  if (!arayuz?.rozetler?.length) return ''
  const ic = arayuz.rozetler
    .map((r) => `<span class="status-chip">${kacir(r.etiket)} <b id="${r.id}">${kacir(r.baslangic)}</b></span>`)
    .join('')
  return `<div class="status-row">${ic}</div>`
}

function aracCubugu(arayuz?: Arayuz): string {
  if (!arayuz?.aracCubugu?.length) return ''
  const ic = arayuz.aracCubugu
    .map(
      (b, i) =>
        `<button class="btn" type="button" data-level="${kacir(b.deger)}" aria-pressed="${i === 0}">${kacir(b.etiket)}</button>`,
    )
    .join('')
  return `<div class="toolbar" id="toolbar">${ic}</div>`
}

function pad(arayuz?: Arayuz): string {
  if (!arayuz?.pad?.length) return ''
  const ic = arayuz.pad
    .map((b) => `<button class="btn" type="button" data-move="${kacir(b.deger)}">${kacir(b.etiket)}</button>`)
    .join('')
  return `<div class="toolbar" id="pad">${ic}</div>`
}

function paneller(arayuz?: Arayuz): string {
  if (!arayuz?.paneller?.length) return ''
  return arayuz.paneller
    .map((p) => `<section class="panel" id="${p.id}"><h2>${kacir(p.baslik)}</h2>${p.ic}</section>`)
    .join('')
}

/** Oyun sayfasının tam gövdesi. */
export function kabukHtml(oyun: KatalogKaydi): string {
  return `
    <div class="game-shell">
      <header class="game-top">
        <div class="left">
          <a class="btn" href="#/">←&nbsp;<span class="uzun">Ana sayfa</span></a>
          <button class="btn btn--icon" id="sound" type="button" aria-label="Sesi aç veya kapat" aria-pressed="true">🔊</button>
          <button class="btn" id="tamekran" type="button" aria-label="Tam ekran" aria-pressed="false"><span aria-hidden="true">⛶</span><span class="uzun">&nbsp;Tam ekran</span></button>
        </div>
        <div class="scores">
          <div class="score-box" id="score-box">
            <span>SKOR</span>
            <strong id="score">0</strong>
            <div class="score-gain" id="score-gain"></div>
          </div>
          <div class="score-box">
            <span>EN İYİ</span>
            <strong id="best">0</strong>
            <small id="best-name"></small>
          </div>
        </div>
      </header>

      <div class="game-intro">
        <div>
          <h1>${kacir(oyun.ad)}</h1>
          <p>${kacir(oyun.aciklama)}</p>
        </div>
        <button class="btn btn--accent" id="restart" type="button">Yeni oyun</button>
      </div>

      ${aracCubugu(oyun.arayuz)}
      ${rozetler(oyun.arayuz)}

      <div class="game-stage" id="game-stage">
        <div class="game-canvas" id="game"></div>
        <div class="overlay" id="overlay" hidden>
          <div class="overlay-card">
            <h2 id="overlay-title"></h2>
            <p id="overlay-text"></p>
            <form class="overlay-form" id="overlay-form" hidden>
              <label for="overlay-name">Tabloya yazılacak ad</label>
              <div class="row">
                <input id="overlay-name" name="nick" type="text" autocomplete="nickname"
                  placeholder="Adını yaz" enterkeyhint="done" />
                <button class="btn btn--accent" id="overlay-submit" type="submit">Kaydet</button>
              </div>
            </form>
            <div class="overlay-actions">
              <button class="btn btn--accent" id="overlay-primary" type="button"></button>
              <button class="btn" id="overlay-secondary" type="button" hidden></button>
            </div>
          </div>
        </div>
      </div>

      ${oyun.arayuz?.tusTakimi ? '<div id="keypad"></div>' : ''}
      ${paneller(oyun.arayuz)}
      ${pad(oyun.arayuz)}

      <p class="hint">${oyun.ipucu}</p>

      <section class="scoreboard" id="scoreboard" hidden>
        <div class="tablo-ust">
          <h2>Skor tablosu</h2>
          <div class="tablo-sekme" id="tablo-sekme">
            <button type="button" data-kapsam="cihaz" aria-pressed="true">Bu cihaz</button>
            <button type="button" data-kapsam="global" aria-pressed="false" hidden>Global</button>
          </div>
        </div>
        <div class="tablo-donem" id="tablo-donem" hidden>
          <button type="button" data-donem="gunluk" aria-pressed="false">Bugün</button>
          <button type="button" data-donem="haftalik" aria-pressed="false">Bu hafta</button>
          <button type="button" data-donem="aylik" aria-pressed="false">Bu ay</button>
          <button type="button" data-donem="tum" aria-pressed="true">Tüm zamanlar</button>
        </div>
        <p class="tablo-not" id="tablo-not" hidden></p>
        <ol id="scoreboard-list"></ol>
      </section>
    </div>
  `
}

/** Oyunun rengini ve tuval oranını CSS değişkenlerine yazar. */
export function temayiUygula(oyun: KatalogKaydi): void {
  const kok = document.documentElement.style
  kok.setProperty('--game-a', oyun.renk[0])
  kok.setProperty('--game-b', oyun.renk[1])
  if (!oyun.tuval) return
  kok.setProperty('--game-aspect', String(oyun.tuval.genislik / oyun.tuval.yukseklik))
  kok.setProperty('--chrome', `${oyun.tuval.disPay}px`)
}

export function temayiTemizle(): void {
  const kok = document.documentElement.style
  for (const ad of ['--game-a', '--game-b', '--game-aspect', '--chrome']) kok.removeProperty(ad)
}
