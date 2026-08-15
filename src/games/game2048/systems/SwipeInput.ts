/** Dokunmatik/fare kaydırmasını yön komutuna çevirir. Phaser'dan bağımsız. */

import { SWIPE_MIN_DISTANCE } from '../config/constants.ts'
import type { Direction } from './Board2048.ts'

export class SwipeInput {
  private readonly target: HTMLElement
  private readonly onSwipe: (direction: Direction) => void
  private startX = 0
  private startY = 0
  private tracking = false

  constructor(target: HTMLElement, onSwipe: (direction: Direction) => void) {
    this.target = target
    this.onSwipe = onSwipe
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

    if (Math.max(absX, absY) < SWIPE_MIN_DISTANCE) return

    if (absX > absY) {
      this.onSwipe(dx > 0 ? 'right' : 'left')
    } else {
      this.onSwipe(dy > 0 ? 'down' : 'up')
    }
  }
}
