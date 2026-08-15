/** Sayfa üstündeki DOM arayüzü: skorlar, yeni oyun butonu ve sonuç katmanı. */

export interface HudCallbacks {
  onRestart: () => void
}

interface OverlayOptions {
  title: string
  text: string
  primaryLabel: string
  onPrimary: () => void
  secondaryLabel?: string
  onSecondary?: () => void
}

function required<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector)
  if (!element) throw new Error(`HUD elemanı bulunamadı: ${selector}`)
  return element
}

export class Hud {
  private readonly scoreEl = required<HTMLElement>('#score')
  private readonly bestEl = required<HTMLElement>('#best')
  private readonly scoreBox = required<HTMLElement>('#score-box')
  private readonly gainEl = required<HTMLElement>('#score-gain')
  private readonly restartBtn = required<HTMLButtonElement>('#restart')
  private readonly overlay = required<HTMLElement>('#overlay')
  private readonly overlayTitle = required<HTMLElement>('#overlay-title')
  private readonly overlayText = required<HTMLElement>('#overlay-text')
  private readonly primaryBtn = required<HTMLButtonElement>('#overlay-primary')
  private readonly secondaryBtn = required<HTMLButtonElement>('#overlay-secondary')

  private primaryAction: () => void = () => {}
  private secondaryAction: () => void = () => {}

  constructor(callbacks: HudCallbacks) {
    this.restartBtn.addEventListener('click', () => callbacks.onRestart())
    // Katman butonlarının davranışı her showOverlay çağrısında yeniden bağlanır.
    this.primaryBtn.addEventListener('click', () => this.primaryAction())
    this.secondaryBtn.addEventListener('click', () => this.secondaryAction())
  }

  setScore(score: number): void {
    this.scoreEl.textContent = String(score)
  }

  setBest(best: number): void {
    this.bestEl.textContent = String(best)
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

    this.overlay.hidden = false
    this.overlay.classList.add('is-open')
  }

  hideOverlay(): void {
    this.overlay.classList.remove('is-open')
    this.overlay.hidden = true
  }
}
