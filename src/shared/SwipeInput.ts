/**
 * Dokunmatik/fare kaydırmasını yön komutuna çevirir. Phaser'dan bağımsız.
 * Bütün oyunlar bunu kullanır.
 */

export type SwipeDirection = 'up' | 'down' | 'left' | 'right'

/** Bir kaydırmanın sayılması için gereken en küçük parmak mesafesi (px). */
const MIN_DISTANCE = 24

export class SwipeInput {
  private readonly target: HTMLElement
  private readonly onSwipe: (direction: SwipeDirection) => void
  private readonly minDistance: number
  private startX = 0
  private startY = 0
  private tracking = false

  constructor(
    target: HTMLElement,
    onSwipe: (direction: SwipeDirection) => void,
    minDistance: number = MIN_DISTANCE,
  ) {
    this.target = target
    this.onSwipe = onSwipe
    this.minDistance = minDistance
    this.target.addEventListener('pointerdown', this.handleDown)
    this.target.addEventListener('pointerup', this.handleUp)
    this.target.addEventListener('pointercancel', this.handleCancel)
  }

  destroy(): void {
    this.target.removeEventListener('pointerdown', this.handleDown)
    this.target.removeEventListener('pointerup', this.handleUp)
    this.target.removeEventListener('pointercancel', this.handleCancel)
  }

  private handleDown = (event: PointerEvent): void => {
    this.tracking = true
    this.startX = event.clientX
    this.startY = event.clientY
  }

  private handleCancel = (): void => {
    this.tracking = false
  }

  private handleUp = (event: PointerEvent): void => {
    if (!this.tracking) return
    this.tracking = false

    const dx = event.clientX - this.startX
    const dy = event.clientY - this.startY
    const absX = Math.abs(dx)
    const absY = Math.abs(dy)

    if (Math.max(absX, absY) < this.minDistance) return

    if (absX > absY) {
      this.onSwipe(dx > 0 ? 'right' : 'left')
    } else {
      this.onSwipe(dy > 0 ? 'down' : 'up')
    }
  }
}
