import * as Phaser from 'phaser'

import { TemelSahne } from '../../../shared/TemelSahne.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { butonGrubu, setChip } from '../../../shared/dom.ts'
import {
  ARALIK,
  COLORS,
  GAME_HEIGHT,
  GAME_WIDTH,
  KARISTIRMA,
  STICKER,
  VARSAYILAN_ZORLUK,
  YUZ_BOYU,
  YUZ_RENKLERI,
  ZORLUK_ADI,
  skorHesapla,
  type Zorluk,
} from '../config/constants.ts'
import { RubikKup, type Hamle } from '../systems/RubikKup.ts'

/** Açılmış küp yerleşimi: [yüz, sütun, satır] — haç biçimi. */
const YERLESIM: [number, number, number][] = [
  [0, 1, 0], // U
  [2, 0, 1], // L
  [4, 1, 1], // F
  [3, 2, 1], // R
  [5, 3, 1], // B
  [1, 1, 2], // D
]

export class GameScene extends TemelSahne {
  private readonly kup = new RubikKup()
  private zorluk: Zorluk = VARSAYILAN_ZORLUK
  private katman!: Phaser.GameObjects.Container

  constructor() {
    super('rubik')
  }

  protected kur(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(14)
    this.katman = this.add.container(0, 0)

    butonGrubu('toolbar', 'level', (v) => {
      this.zorluk = v as Zorluk
      this.yenidenBasla()
    })

    const pad = document.getElementById('pad')
    if (pad) {
      for (const button of pad.querySelectorAll<HTMLButtonElement>('button[data-move]')) {
        button.addEventListener('click', () => this.hamleYap(button.dataset.move as Hamle))
      }
    }
  }

  protected yeniOyun(): void {
    this.kup.karistir(KARISTIRMA[this.zorluk])
    setChip('moves', 0)
    setChip('faces', `${this.kup.dogruYuz}/6`)
    this.skorGoster(0)
    this.ciz()
  }

  private hamleYap(hamle: Hamle): void {
    if (this.bitti || !hamle) return
    this.sayac.basla()
    this.kup.uygula(hamle)
    sesler.tik()
    setChip('moves', this.kup.hamle)
    setChip('faces', `${this.kup.dogruYuz}/6`)
    this.ciz()

    if (this.kup.cozuldu) {
      const skor = skorHesapla(this.zorluk, this.kup.hamle)
      this.turuBitir({
        baslik: 'Küpü çözdün! 🎉',
        ozet: `${ZORLUK_ADI[this.zorluk]} · ${this.kup.hamle} hamle · Skor: ${skor}`,
        skor,
      })
    }
  }

  private ciz(): void {
    this.katman.removeAll(true)
    const genislik = 4 * YUZ_BOYU + 3 * ARALIK * 2
    const solX = (GAME_WIDTH - genislik) / 2
    const ustY = (GAME_HEIGHT - (3 * YUZ_BOYU + 2 * ARALIK * 2)) / 2

    for (const [yuz, sutun, satir] of YERLESIM) {
      const bx = solX + sutun * (YUZ_BOYU + ARALIK * 2)
      const by = ustY + satir * (YUZ_BOYU + ARALIK * 2)
      for (let i = 0; i < 9; i++) {
        const sx = bx + (i % 3) * (STICKER + ARALIK) + STICKER / 2
        const sy = by + Math.floor(i / 3) * (STICKER + ARALIK) + STICKER / 2
        this.katman.add(
          this.add.rectangle(sx, sy, STICKER, STICKER, YUZ_RENKLERI[this.kup.yuzler[yuz][i]]).setRounded(4),
        )
      }
    }
  }
}
