/**
 * Sayfa üzerinde DOM tuş takımı: harf klavyesi (Adam Asmaca, Kelime Bulmaca)
 * veya rakam takımı (Sudoku). Dokunmatikte kullanılabilir olması için DOM,
 * tuvale çizilmiyor.
 */

export type KeyState = 'idle' | 'correct' | 'wrong' | 'used'

export interface KeyPadKey {
  /** Butonda görünen yazı. */
  label: string
  /** onPress'e gönderilen değer (verilmezse label). */
  value?: string
  /** İki birim genişlikte dursun (Sil, Boşluk gibi). */
  wide?: boolean
  /** Kaç ızgara sütunu kaplasın? Verilirse `wide` yerine bu geçerli. */
  span?: number
}

export interface KeyPadOptions {
  container: HTMLElement
  keys: (string | KeyPadKey)[]
  onPress: (value: string) => void
  /** Satır başına düşen tuş sayısı (CSS grid sütunu). */
  columns?: number
}

interface NormalKey {
  label: string
  value: string
  span: number
}

const normalize = (key: string | KeyPadKey): NormalKey =>
  typeof key === 'string'
    ? { label: key, value: key, span: 1 }
    : {
        label: key.label,
        value: key.value ?? key.label,
        span: key.span ?? (key.wide ? 2 : 1),
      }

export class KeyPad {
  private readonly container: HTMLElement
  private readonly buttons = new Map<string, HTMLButtonElement>()

  constructor(options: KeyPadOptions) {
    this.container = options.container
    this.container.replaceChildren()
    this.container.classList.add('keypad')
    if (options.columns) {
      this.container.style.setProperty('--keypad-columns', String(options.columns))
    }

    for (const raw of options.keys) {
      const key = normalize(raw)
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'keypad-key'
      if (key.span > 1) button.style.gridColumn = `span ${key.span}`
      button.textContent = key.label
      button.dataset.value = key.value
      button.addEventListener('click', () => {
        if (button.disabled) return
        options.onPress(key.value)
      })
      this.buttons.set(key.value, button)
      this.container.append(button)
    }
  }

  setState(value: string, state: KeyState): void {
    const button = this.buttons.get(value)
    if (!button) return
    button.classList.remove('is-correct', 'is-wrong', 'is-used')
    if (state === 'correct') button.classList.add('is-correct')
    else if (state === 'wrong') button.classList.add('is-wrong')
    else if (state === 'used') button.classList.add('is-used')
    button.disabled = state !== 'idle'
  }

  /** Aç/kapa tuşları için basılı görünüm (Sudoku'daki kalem modu gibi). */
  setPressed(value: string, pressed: boolean): void {
    const button = this.buttons.get(value)
    if (!button) return
    button.classList.toggle('is-pressed', pressed)
    button.setAttribute('aria-pressed', String(pressed))
  }

  setEnabled(enabled: boolean): void {
    for (const button of this.buttons.values()) {
      button.disabled = !enabled
    }
  }

  reset(): void {
    for (const button of this.buttons.values()) {
      button.classList.remove('is-correct', 'is-wrong', 'is-used')
      button.disabled = false
    }
  }

  destroy(): void {
    this.container.replaceChildren()
    this.buttons.clear()
  }
}
