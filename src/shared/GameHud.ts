/**
 * Sayfa üstündeki ortak DOM arayüzü: skorlar, yeni oyun butonu, skor tablosu
 * ve sonuç katmanı. Her oyun sayfası aynı id'leri kullanır.
 */

import { MAX_NAME_LENGTH, type ScoreEntry } from './Leaderboard.ts'
import type { Donem, TabloKaydi } from './Sunucu.ts'
import { sesler } from './Sesler.ts'

export interface GameHudCallbacks {
  onRestart: () => void
}

/** Katmanda takma ad sorulacaksa. */
export interface OverlayPrompt {
  defaultName: string
  submitLabel: string
  onSubmit: (name: string) => void
}

export interface OverlayOptions {
  title: string
  text: string
  primaryLabel: string
  onPrimary: () => void
  secondaryLabel?: string
  onSecondary?: () => void
  prompt?: OverlayPrompt
}

function required<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector)
  if (!element) throw new Error(`HUD elemanı bulunamadı: ${selector}`)
  return element
}

export class GameHud {
  private readonly scoreEl = required<HTMLElement>('#score')
  private readonly bestEl = required<HTMLElement>('#best')
  private readonly bestNameEl = required<HTMLElement>('#best-name')
  private readonly scoreBox = required<HTMLElement>('#score-box')
  private readonly gainEl = required<HTMLElement>('#score-gain')
  private readonly restartBtn = required<HTMLButtonElement>('#restart')
  private readonly soundBtn = document.querySelector<HTMLButtonElement>('#sound')
  private readonly tamEkranBtn = document.querySelector<HTMLButtonElement>('#tamekran')

  private readonly board = required<HTMLElement>('#scoreboard')
  private readonly boardList = required<HTMLOListElement>('#scoreboard-list')
  private readonly sekmeler = document.querySelector<HTMLElement>('#tablo-sekme')
  private readonly donemler = document.querySelector<HTMLElement>('#tablo-donem')
  private readonly tabloNotu = document.querySelector<HTMLElement>('#tablo-not')

  private readonly overlay = required<HTMLElement>('#overlay')
  private readonly overlayTitle = required<HTMLElement>('#overlay-title')
  private readonly overlayText = required<HTMLElement>('#overlay-text')
  private readonly form = required<HTMLFormElement>('#overlay-form')
  private readonly nameInput = required<HTMLInputElement>('#overlay-name')
  private readonly submitBtn = required<HTMLButtonElement>('#overlay-submit')
  private readonly primaryBtn = required<HTMLButtonElement>('#overlay-primary')
  private readonly secondaryBtn = required<HTMLButtonElement>('#overlay-secondary')

  private primaryAction: () => void = () => {}
  private secondaryAction: () => void = () => {}
  private submitAction: (name: string) => void = () => {}

  constructor(callbacks: GameHudCallbacks) {
    this.nameInput.maxLength = MAX_NAME_LENGTH
    this.kurSesButonu()
    this.kurTamEkranButonu()
    this.restartBtn.addEventListener('click', () => callbacks.onRestart())
    // Katman butonlarının davranışı her showOverlay çağrısında yeniden bağlanır.
    this.primaryBtn.addEventListener('click', () => this.primaryAction())
    this.secondaryBtn.addEventListener('click', () => this.secondaryAction())
    this.form.addEventListener('submit', (event) => {
      event.preventDefault()
      this.submitAction(this.nameInput.value)
    })
  }

  /** Ses aç/kapat düğmesi; tercih localStorage'da saklanır. */
  private kurSesButonu(): void {
    const button = this.soundBtn
    if (!button) return

    const goster = (): void => {
      button.textContent = sesler.kapali ? '🔇' : '🔊'
      button.setAttribute('aria-pressed', String(!sesler.kapali))
    }
    goster()
    button.addEventListener('click', () => {
      sesler.degistir()
      goster()
    })
    sesler.ilkDokunustaUyandir()
  }

  /**
   * Tam ekran düğmesi.
   *
   * Tuval değil **sayfanın tamamı** tam ekrana geçer; böylece skor kutuları,
   * rozetler, tuş takımı ve paneller görünür kalır. Tarayıcı desteklemiyorsa
   * (iPhone Safari'de yok) düğme gizlenir.
   */
  private kurTamEkranButonu(): void {
    const button = this.tamEkranBtn
    if (!button) return
    const kok = document.documentElement
    if (typeof kok.requestFullscreen !== 'function') {
      button.hidden = true
      return
    }

    const goster = (): void => {
      const acik = document.fullscreenElement !== null
      button.setAttribute('aria-pressed', String(acik))
      button.setAttribute('aria-label', acik ? 'Tam ekrandan çık' : 'Tam ekran')
    }
    goster()

    button.addEventListener('click', () => {
      // Tarayıcı reddederse sessizce geç: oyun normal boyutta sürsün.
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => {})
      else void kok.requestFullscreen().catch(() => {})
    })

    // Esc ile çıkışta da etiket tazelensin. Sayfa değişince kendini söker.
    const dinle = (): void => {
      if (!button.isConnected) {
        document.removeEventListener('fullscreenchange', dinle)
        return
      }
      goster()
    }
    document.addEventListener('fullscreenchange', dinle)
  }

  setScore(score: number): void {
    this.scoreEl.textContent = String(score)
  }

  /** En iyi skoru ve varsa sahibinin adını gösterir. */
  setBest(score: number, name?: string | null): void {
    this.bestEl.textContent = String(score)
    this.bestNameEl.textContent = score > 0 && name ? name : ''
  }

  /** Kazanılan puanı skor kutusunun üzerinde kısa süre gösterir. */
  showGain(amount: number): void {
    if (amount <= 0) return
    this.gainEl.textContent = `+${amount}`
    this.gainEl.classList.remove('is-active')
    // Animasyonu yeniden başlatmak için reflow tetikle.
    void this.gainEl.offsetWidth
    this.gainEl.classList.add('is-active')
    this.scoreBox.classList.remove('is-bumped')
    void this.scoreBox.offsetWidth
    this.scoreBox.classList.add('is-bumped')
  }

  /**
   * Global sekmesini açar ve sekme tıklamalarını bağlar.
   * Sunucu kapalıysa hiç çağrılmaz; tablo yalnız cihaz kayıtlarını gösterir.
   */
  tabloSekmeleriniAc(secildi: (kapsam: 'cihaz' | 'global', donem: Donem) => void): void {
    if (!this.sekmeler) return
    const globalDugme = this.sekmeler.querySelector<HTMLButtonElement>('button[data-kapsam="global"]')
    if (globalDugme) globalDugme.hidden = false

    let kapsam: 'cihaz' | 'global' = 'cihaz'
    let donem: Donem = 'tum'

    const isaretle = (kap: HTMLElement | null, ad: string, deger: string): void => {
      for (const b of kap?.querySelectorAll<HTMLButtonElement>(`button[data-${ad}]`) ?? []) {
        b.setAttribute('aria-pressed', String(b.dataset[ad] === deger))
      }
    }

    this.sekmeler.addEventListener('click', (olay) => {
      const dugme = (olay.target as HTMLElement).closest<HTMLButtonElement>('button[data-kapsam]')
      if (!dugme?.dataset.kapsam) return
      kapsam = dugme.dataset.kapsam as 'cihaz' | 'global'
      isaretle(this.sekmeler, 'kapsam', kapsam)
      if (this.donemler) this.donemler.hidden = kapsam !== 'global'
      secildi(kapsam, donem)
    })

    this.donemler?.addEventListener('click', (olay) => {
      const dugme = (olay.target as HTMLElement).closest<HTMLButtonElement>('button[data-donem]')
      if (!dugme?.dataset.donem) return
      donem = dugme.dataset.donem as Donem
      isaretle(this.donemler, 'donem', donem)
      secildi(kapsam, donem)
    })
  }

  /** Tablonun üstünde kısa bilgi ("Yükleniyor…", "Henüz kayıt yok"). */
  tabloNotuYaz(mesaj: string | null): void {
    if (!this.tabloNotu) return
    this.tabloNotu.textContent = mesaj ?? ''
    this.tabloNotu.hidden = !mesaj
  }

  /** Sunucudan gelen global tabloyu çizer. */
  globalTabloCiz(kayitlar: TabloKaydi[]): void {
    this.boardList.replaceChildren()
    this.board.hidden = false
    for (const kayit of kayitlar) {
      const item = document.createElement('li')
      if (kayit.ben) item.classList.add('is-ben')

      const rank = document.createElement('span')
      rank.className = 'rank'
      rank.textContent = String(kayit.sira)

      const name = document.createElement('span')
      name.className = 'name'
      name.textContent = kayit.ad

      if (kayit.dogrulandi) {
        const rozet = document.createElement('span')
        rozet.className = 'dogrulandi'
        rozet.textContent = '✓'
        rozet.title = 'Sunucuda doğrulandı'
        name.append(rozet)
      }

      const points = document.createElement('span')
      points.className = 'points'
      points.textContent = String(kayit.skor)

      item.append(rank, name, points)
      this.boardList.append(item)
    }
  }

  /** Skor tablosunu çizer. `highlightAt`, yeni eklenen kaydı vurgular. */
  renderScoreboard(entries: ScoreEntry[], highlightAt?: number): void {
    this.boardList.replaceChildren()
    this.board.hidden = entries.length === 0
    if (entries.length === 0) return

    entries.forEach((entry, index) => {
      const item = document.createElement('li')
      if (highlightAt !== undefined && entry.at === highlightAt) item.classList.add('is-new')

      const rank = document.createElement('span')
      rank.className = 'rank'
      rank.textContent = String(index + 1)

      const name = document.createElement('span')
      name.className = 'name'
      // textContent: isim kullanıcıdan geliyor, HTML olarak yorumlanmasın.
      name.textContent = entry.name

      const points = document.createElement('span')
      points.className = 'points'
      points.textContent = String(entry.score)

      item.append(rank, name, points)
      this.boardList.append(item)
    })
  }

  showOverlay(options: OverlayOptions): void {
    this.overlayTitle.textContent = options.title
    this.overlayText.textContent = options.text
    this.primaryBtn.textContent = options.primaryLabel
    this.primaryAction = options.onPrimary

    if (options.secondaryLabel && options.onSecondary) {
      this.secondaryBtn.textContent = options.secondaryLabel
      this.secondaryAction = options.onSecondary
      this.secondaryBtn.hidden = false
    } else {
      this.secondaryBtn.hidden = true
    }

    if (options.prompt) {
      this.nameInput.value = options.prompt.defaultName
      this.submitBtn.textContent = options.prompt.submitLabel
      this.submitAction = options.prompt.onSubmit
      this.form.hidden = false
    } else {
      this.form.hidden = true
    }

    this.overlay.hidden = false
    this.overlay.classList.add('is-open')

    if (options.prompt) {
      this.nameInput.focus()
      this.nameInput.select()
    }
  }

  hideOverlay(): void {
    this.overlay.classList.remove('is-open')
    this.overlay.hidden = true
    this.form.hidden = true
  }
}
