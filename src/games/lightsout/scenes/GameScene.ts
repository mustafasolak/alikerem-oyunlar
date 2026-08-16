import * as Phaser from 'phaser'

import { KareIzgara, izgaraYerlesimi } from '../../../shared/KareIzgara.ts'
import { TemelSahne } from '../../../shared/TemelSahne.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { butonGrubu, setChip } from '../../../shared/dom.ts'
import {
  BASMA_SURESI,
  BOARD_PADDING,
  BOARD_RADIUS,
  COLORS,
  GAME_HEIGHT,
  GAME_WIDTH,
  VARSAYILAN_ZORLUK,
  ZORLUKLAR,
  skorHesapla,
  type Zorluk,
} from '../config/constants.ts'
import { LightsOut } from '../systems/LightsOut.ts'

export class GameScene extends TemelSahne {
  private oyun!: LightsOut
  private izgara?: KareIzgara
  private zorluk: Zorluk = VARSAYILAN_ZORLUK

  constructor() {
    super('lightsout')
  }

  protected kur(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(BOARD_RADIUS)
    butonGrubu('toolbar', 'level', (value) => {
      this.zorluk = value as Zorluk
      this.yenidenBasla()
    })
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.tikla(p))
  }

  protected yeniOyun(): void {
    const ayar = ZORLUKLAR[this.zorluk]
    this.oyun = new LightsOut(ayar.boyut, ayar.karistirma)

    this.izgara?.katman.destroy()
    const yerlesim = izgaraYerlesimi(GAME_WIDTH, GAME_HEIGHT, ayar.boyut, ayar.boyut, BOARD_PADDING)
    this.izgara = new KareIzgara(this, {
      sutun: ayar.boyut,
      satir: ayar.boyut,
      hucreBoyu: yerlesim.hucreBoyu,
      ofsetX: yerlesim.ofsetX,
      ofsetY: yerlesim.ofsetY,
      bosluk: 10,
      radius: 14,
      zeminRenk: COLORS.KAPALI,
    })

    setChip('moves', 0)
    this.skorGoster(0)
    this.ciz()
  }

  private tikla(pointer: Phaser.Input.Pointer): void {
    if (this.bitti || !this.izgara) return
    const hucre = this.izgara.hucreBul(pointer)
    if (!hucre) return

    const index = this.oyun.index(hucre.satir, hucre.sutun)
    if (!this.oyun.bas(index)) return

    sesler.tik()
    setChip('moves', this.oyun.hamle)
    this.ciz()

    // Basılan grubu kısaca büyüt: hangi karelerin değiştiği görünsün.
    for (const etkilenen of this.oyun.etkilenenler(index)) {
      const view = this.izgara.gorunumIndex(etkilenen)
      this.tweens.add({
        targets: view.zemin,
        scale: 1.12,
        duration: BASMA_SURESI / 2,
        yoyo: true,
        ease: 'Quad.easeOut',
      })
    }

    if (this.oyun.cozuldu) {
      const skor = skorHesapla(this.zorluk, this.oyun.hamle)
      this.turuBitir({
        baslik: 'Hepsini söndürdün! 🎉',
        ozet: `${ZORLUKLAR[this.zorluk].ad} · ${this.oyun.hamle} hamle · Skor: ${skor}`,
        skor,
      })
    }
  }

  private ciz(): void {
    this.izgara?.uygula((view, _satir, _sutun, index) => {
      const yanik = this.oyun.isiklar[index]
      view.zemin.setFillStyle(yanik ? COLORS.ACIK : COLORS.KAPALI)
      view.zemin.setStrokeStyle(yanik ? 3 : 0, COLORS.ACIK_KENAR)
    })
  }
}
