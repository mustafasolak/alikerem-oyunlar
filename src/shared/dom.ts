/** Oyun sayfalarındaki küçük DOM işleri. */

/** Durum rozetindeki değeri günceller (eleman yoksa sessizce geçer). */
export function setChip(id: string, value: string | number): void {
  const element = document.getElementById(id)
  if (element) element.textContent = String(value)
}

export function element<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id)
  if (!found) throw new Error(`Eleman bulunamadı: #${id}`)
  return found as T
}

/**
 * `aria-pressed` ile çalışan buton grubu (zorluk seçimi gibi).
 * Butonlar `data-<attr>="<değer>"` taşır.
 */
export function butonGrubu(
  containerId: string,
  attr: string,
  onSelect: (value: string) => void,
): (value: string) => void {
  const container = document.getElementById(containerId)
  if (!container) return () => {}

  const buttons = [...container.querySelectorAll<HTMLButtonElement>(`button[data-${attr}]`)]
  const isaretle = (value: string): void => {
    for (const button of buttons) {
      button.setAttribute('aria-pressed', String(button.dataset[attr] === value))
    }
  }

  for (const button of buttons) {
    button.addEventListener('click', () => {
      const value = button.dataset[attr]
      if (!value) return
      isaretle(value)
      onSelect(value)
    })
  }
  return isaretle
}
