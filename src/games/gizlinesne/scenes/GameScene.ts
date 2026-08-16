import * as Phaser from 'phaser'

import { TemelSahne } from '../../../shared/TemelSahne.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { element, setChip } from '../../../shared/dom.ts'
import {
  ARANAN_SAYISI,
  COLORS,
  GAME_HEIGHT,
  GAME_WIDTH,
  HATA_CEZASI,
  MIN_SKOR,
  NESNE_PUANI,
  SIMGE_BOYU,
  SURE_BONUS_LIMITI,
} from '../config/constants.ts'
import { GizliNesne } from '../systems/GizliNesne.ts'

export class GameScene extends TemelSahne {
  private oyun!: GizliNesne
  private katman!: Phaser.GameObjects.Container

  constructor() {
    super('gizlinesne')
  }

  protected kur(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(14)
    this.katman = this.add.container(0, 0)
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.dokun(p))
  }

  protected yeniOyun(): void {
    this.oyun = new GizliNesne(GAME_WIDTH, GAME_HEIGHT, SIMGE_BOYU)
    setChip('remaining', this.oyun.kalan)
    setChip('timer', '0:00')
    this.skorGoster(0)
    this.listeyiTazele()
    this.ciz()
  }

  private dokun(p: Phaser.Input.Pointer): void {
    if (this.bitti) return
    this.sayac.basla()
    const sonuc = this.oyun.dokun(p.worldX, p.worldY, SIMGE_BOYU)

    if (sonuc === 'dogru') {
      sesler.dogru()
      setChip('remaining', this.oyun.kalan)
      this.listeyiTazele()
      this.ciz()
      if (this.oyun.bitti) {
        const skor = Math.max(
          MIN_SKOR,
          ARANAN_SAYISI * NESNE_PUANI + Math.max(0, SURE_BONUS_LIMITI - this.sayac.saniye) - this.oyun.hata * HATA_CEZASI,
        )
        this.turuBitir({
          baslik: 'Hepsini buldun! 🎉',
          ozet: `${this.sayac.yazi} · ${this.oyun.hata} yanlış · Skor: ${skor}`,
          skor,
        })
      }
      return
    }

    sesler.yanlis()
    this.cameras.main.shake(100, 0.003)
  }

  private listeyiTazele(): void {
    const liste = element<HTMLUListElement>('wanted-list')
    liste.replaceChildren()
    for (const simge of this.oyun.arananlar) {
      const li = document.createElement('li')
      li.textContent = simge
      if (this.oyun.bulunduMu(simge)) li.classList.add('is-found')
      liste.append(li)
    }
  }

  private ciz(): void {
    this.katman.removeAll(true)
    for (const nesne of this.oyun.nesneler) {
      const yazi = this.add
        .text(nesne.x, nesne.y, nesne.simge, { fontSize: `${SIMGE_BOYU}px` })
        .setOrigin(0.5)
      if (nesne.bulundu) {
        yazi.setAlpha(0.35)
        this.katman.add(this.add.circle(nesne.x, nesne.y, SIMGE_BOYU * 0.7, 0x000000, 0).setStrokeStyle(3, COLORS.BULUNDU))
      }
      this.katman.add(yazi)
    }
  }
}
