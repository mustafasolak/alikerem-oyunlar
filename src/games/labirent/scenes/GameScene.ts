import * as Phaser from 'phaser'

import { SwipeInput } from '../../../shared/SwipeInput.ts'
import { TemelSahne } from '../../../shared/TemelSahne.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { butonGrubu, setChip } from '../../../shared/dom.ts'
import {
  BOARD_PADDING,
  COLORS,
  DUVAR_KALINLIK,
  GAME_HEIGHT,
  GAME_WIDTH,
  HAREKET_SURESI,
  OYUNCU_ORAN,
  SWIPE_TARGET_ID,
  VARSAYILAN_ZORLUK,
  ZORLUKLAR,
  skorHesapla,
  type Zorluk,
} from '../config/constants.ts'
import { Labirent, type Yon } from '../systems/Labirent.ts'

const CAPTURED = ['LEFT', 'RIGHT', 'UP', 'DOWN']
const TUSLAR: Record<string, Yon> = {
  'keydown-LEFT': 'left',
  'keydown-A': 'left',
  'keydown-RIGHT': 'right',
  'keydown-D': 'right',
  'keydown-UP': 'up',
  'keydown-W': 'up',
  'keydown-DOWN': 'down',
  'keydown-S': 'down',
}

export class GameScene extends TemelSahne {
  private oyun!: Labirent
  private zorluk: Zorluk = VARSAYILAN_ZORLUK
  private hucreBoyu = 0
  private cizim!: Phaser.GameObjects.Graphics
  private izKatmani!: Phaser.GameObjects.Container
  private oyuncuView!: Phaser.GameObjects.Arc
  private cikisView!: Phaser.GameObjects.Rectangle
  private swipe?: SwipeInput

  constructor() {
    super('labirent')
  }

  protected kur(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(14)
    this.izKatmani = this.add.container(0, 0)
    this.cizim = this.add.graphics()
    this.cikisView = this.add.rectangle(0, 0, 10, 10, COLORS.CIKIS).setRounded(3)
    this.oyuncuView = this.add.circle(0, 0, 6, COLORS.OYUNCU)

    const keyboard = this.input.keyboard
    if (keyboard) {
      for (const [olay, yon] of Object.entries(TUSLAR)) keyboard.on(olay, () => this.git(yon))
    }
    this.tuslariYakala(CAPTURED)

    this.swipe = new SwipeInput(document.getElementById(SWIPE_TARGET_ID) ?? this.game.canvas, (yon) => this.git(yon))
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.swipe?.destroy())

    const pad = document.getElementById('pad')
    if (pad) {
      for (const button of pad.querySelectorAll<HTMLButtonElement>('button[data-move]')) {
        button.addEventListener('click', () => this.git(button.dataset.move as Yon))
      }
    }

    butonGrubu('toolbar', 'level', (value) => {
      this.zorluk = value as Zorluk
      this.yenidenBasla()
    })
  }

  protected yeniOyun(): void {
    const ayar = ZORLUKLAR[this.zorluk]
    this.oyun = new Labirent(ayar.boyut)
    this.hucreBoyu = Math.floor((GAME_WIDTH - BOARD_PADDING * 2) / ayar.boyut)

    setChip('moves', 0)
    setChip('timer', '0:00')
    this.skorGoster(0)
    this.duvarlariCiz()
    this.izKatmani.removeAll(true)
    this.taslariYerlestir(false)
  }

  private git(yon: Yon): void {
    if (this.bitti || this.yaziyor) return
    if (!this.oyun.git(yon)) {
      sesler.yanlis()
      return
    }
    this.sayac.basla()
    sesler.tik()
    setChip('moves', this.oyun.hamle)
    this.izEkle()
    this.taslariYerlestir(true)

    if (this.oyun.bitti) {
      const skor = skorHesapla(this.zorluk, this.oyun.hamle, this.sayac.saniye)
      this.turuBitir({
        baslik: 'Çıkışı buldun! 🎉',
        ozet: `${ZORLUKLAR[this.zorluk].ad} · ${this.oyun.hamle} hamle · ${this.sayac.yazi} · Skor: ${skor}`,
        skor,
        gecikme: HAREKET_SURESI + 220,
      })
    }
  }

  private x(sutun: number): number {
    return BOARD_PADDING + sutun * this.hucreBoyu
  }

  private y(satir: number): number {
    return BOARD_PADDING + satir * this.hucreBoyu
  }

  private duvarlariCiz(): void {
    this.cizim.clear()
    this.cizim.fillStyle(COLORS.YOL, 1)
    this.cizim.fillRoundedRect(
      BOARD_PADDING,
      BOARD_PADDING,
      this.oyun.boyut * this.hucreBoyu,
      this.oyun.boyut * this.hucreBoyu,
      8,
    )
    this.cizim.lineStyle(DUVAR_KALINLIK, COLORS.DUVAR, 1)

    for (let satir = 0; satir < this.oyun.boyut; satir++) {
      for (let sutun = 0; sutun < this.oyun.boyut; sutun++) {
        const d = this.oyun.duvar(satir, sutun)
        const x = this.x(sutun)
        const y = this.y(satir)
        const b = this.hucreBoyu
        if (d.ust) this.cizim.lineBetween(x, y, x + b, y)
        if (d.sol) this.cizim.lineBetween(x, y, x, y + b)
        if (satir === this.oyun.boyut - 1 && d.alt) this.cizim.lineBetween(x, y + b, x + b, y + b)
        if (sutun === this.oyun.boyut - 1 && d.sag) this.cizim.lineBetween(x + b, y, x + b, y + b)
      }
    }
  }

  private izEkle(): void {
    const nokta = this.add.circle(
      this.x(this.oyun.oyuncu.sutun) + this.hucreBoyu / 2,
      this.y(this.oyun.oyuncu.satir) + this.hucreBoyu / 2,
      Math.max(2, this.hucreBoyu * 0.14),
      COLORS.IZ,
    )
    this.izKatmani.add(nokta)
  }

  private taslariYerlestir(animasyonlu: boolean): void {
    const yaricap = Math.max(4, this.hucreBoyu * OYUNCU_ORAN)
    this.oyuncuView.setRadius(yaricap)
    this.cikisView.setSize(this.hucreBoyu * 0.55, this.hucreBoyu * 0.55)
    this.cikisView.setPosition(
      this.x(this.oyun.cikis.sutun) + this.hucreBoyu / 2,
      this.y(this.oyun.cikis.satir) + this.hucreBoyu / 2,
    )

    const hedefX = this.x(this.oyun.oyuncu.sutun) + this.hucreBoyu / 2
    const hedefY = this.y(this.oyun.oyuncu.satir) + this.hucreBoyu / 2
    if (animasyonlu) {
      this.tweens.add({ targets: this.oyuncuView, x: hedefX, y: hedefY, duration: HAREKET_SURESI, ease: 'Quad.easeOut' })
    } else {
      this.oyuncuView.setPosition(hedefX, hedefY)
    }
  }
}
