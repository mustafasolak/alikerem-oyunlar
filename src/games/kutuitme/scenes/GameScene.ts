import * as Phaser from 'phaser'

import { KareIzgara, izgaraYerlesimi } from '../../../shared/KareIzgara.ts'
import { SwipeInput } from '../../../shared/SwipeInput.ts'
import { TemelSahne } from '../../../shared/TemelSahne.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { setChip } from '../../../shared/dom.ts'
import {
  BOARD_PADDING,
  BOLUMLER,
  COLORS,
  GAME_HEIGHT,
  GAME_WIDTH,
  HAREKET_SURESI,
  SWIPE_TARGET_ID,
  skorHesapla,
} from '../config/constants.ts'
import { Sokoban, type Yon } from '../../sokoban/systems/Sokoban.ts'

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
  private oyun!: Sokoban
  private bolum = 0
  private izgara?: KareIzgara
  private oyuncuView!: Phaser.GameObjects.Arc
  private swipe?: SwipeInput

  constructor() {
    super('kutuitme')
  }

  protected kur(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(14)
    this.oyuncuView = this.add.circle(0, 0, 10, COLORS.OYUNCU)

    const keyboard = this.input.keyboard
    if (keyboard) {
      for (const [olay, yon] of Object.entries(TUSLAR)) keyboard.on(olay, () => this.git(yon))
      keyboard.on('keydown-Z', () => this.geriAl())
      keyboard.on('keydown-BACKSPACE', () => this.geriAl())
    }
    this.tuslariYakala(CAPTURED)

    this.swipe = new SwipeInput(document.getElementById(SWIPE_TARGET_ID) ?? this.game.canvas, (yon) => this.git(yon))
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.swipe?.destroy())

    const pad = document.getElementById('pad')
    if (pad) {
      for (const button of pad.querySelectorAll<HTMLButtonElement>('button[data-move]')) {
        const hareket = button.dataset.move
        button.addEventListener('click', () => (hareket === 'undo' ? this.geriAl() : this.git(hareket as Yon)))
      }
    }
  }

  protected yeniOyun(): void {
    this.oyun = new Sokoban(BOLUMLER[this.bolum])
    this.izgarayiKur()
    setChip('level', this.bolum + 1)
    setChip('moves', 0)
    this.skorGoster(0)
    this.ciz(false)
  }

  private izgarayiKur(): void {
    this.izgara?.katman.destroy()
    const yerlesim = izgaraYerlesimi(
      GAME_WIDTH,
      GAME_HEIGHT,
      this.oyun.sutunSayisi,
      this.oyun.satirSayisi,
      BOARD_PADDING,
    )
    this.izgara = new KareIzgara(this, {
      sutun: this.oyun.sutunSayisi,
      satir: this.oyun.satirSayisi,
      hucreBoyu: yerlesim.hucreBoyu,
      ofsetX: yerlesim.ofsetX,
      ofsetY: yerlesim.ofsetY,
      bosluk: 3,
      radius: 6,
      zeminRenk: COLORS.ZEMIN,
    })
    // Oyuncu kutuların üstünde kalsın
    this.children.bringToTop(this.oyuncuView)
    this.oyuncuView.setRadius(yerlesim.hucreBoyu * 0.3)
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
    this.ciz(true)

    if (this.oyun.bitti) this.bolumBitti()
  }

  private geriAl(): void {
    if (this.bitti || !this.oyun.geriAl()) return
    sesler.kaydir()
    setChip('moves', this.oyun.hamle)
    this.ciz(true)
  }

  private bolumBitti(): void {
    sesler.dogru()
    const sonBolum = this.bolum >= BOLUMLER.length - 1
    const skor = skorHesapla(this.bolum + 1, this.oyun.hamle)

    if (!sonBolum) {
      this.skorGoster(skor)
      this.time.delayedCall(HAREKET_SURESI + 260, () => {
        this.bolum++
        this.oyun = new Sokoban(BOLUMLER[this.bolum])
        this.izgarayiKur()
        setChip('level', this.bolum + 1)
        setChip('moves', 0)
        this.ciz(false)
      })
      return
    }

    this.turuBitir({
      baslik: 'Bütün bölümleri bitirdin! 🎉',
      ozet: `${BOLUMLER.length} bölüm · son bölüm ${this.oyun.hamle} hamle · Skor: ${skor}`,
      skor,
      gecikme: HAREKET_SURESI + 240,
    })
  }

  /** Son bölüm bitince baştan başla. */
  protected override yenidenBasla(): void {
    this.bolum = 0
    super.yenidenBasla()
  }

  private ciz(animasyonlu: boolean): void {
    this.izgara?.uygula((view, satir, sutun) => {
      const duvar = this.oyun.duvarMi(satir, sutun)
      const kutu = this.oyun.kutuMu(satir, sutun)
      const hedef = this.oyun.hedefMi(satir, sutun)

      view.zemin.setFillStyle(
        duvar ? COLORS.DUVAR : kutu ? (hedef ? COLORS.KUTU_YERINDE : COLORS.KUTU) : hedef ? COLORS.HEDEF : COLORS.ZEMIN,
      )
      view.zemin.setAlpha(!duvar && !kutu && hedef ? 0.55 : 1)
      view.yazi.setText('')
    })

    if (!this.izgara) return
    const x = this.izgara.x(this.oyun.oyuncu.sutun)
    const y = this.izgara.y(this.oyun.oyuncu.satir)
    if (animasyonlu) {
      this.tweens.add({ targets: this.oyuncuView, x, y, duration: HAREKET_SURESI, ease: 'Quad.easeOut' })
    } else {
      this.oyuncuView.setPosition(x, y)
    }
  }
}
