import * as Phaser from 'phaser'

import { TemelSahne } from '../../../shared/TemelSahne.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { butonGrubu, setChip } from '../../../shared/dom.ts'
import {
  ADA_ORAN,
  BOARD_PADDING,
  COLORS,
  FONT_FAMILY,
  GAME_HEIGHT,
  GAME_WIDTH,
  KOPRU_ARALIK,
  KOPRU_KALINLIK,
  VARSAYILAN_ZORLUK,
  ZORLUKLAR,
  skorHesapla,
  type Zorluk,
} from '../config/constants.ts'
import { Hashi } from '../systems/Hashi.ts'

export class GameScene extends TemelSahne {
  private oyun!: Hashi
  private zorluk: Zorluk = VARSAYILAN_ZORLUK
  private katman!: Phaser.GameObjects.Container
  private cizim!: Phaser.GameObjects.Graphics
  private hucreBoyu = 0
  private secili = -1

  constructor() {
    super('kopru')
  }

  protected kur(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(14)
    this.cizim = this.add.graphics()
    this.katman = this.add.container(0, 0)
    butonGrubu('toolbar', 'level', (v) => {
      this.zorluk = v as Zorluk
      this.yenidenBasla()
    })
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.dokun(p))
  }

  protected yeniOyun(): void {
    const ayar = ZORLUKLAR[this.zorluk]
    this.oyun = new Hashi(ayar.boyut, ayar.ada)
    this.hucreBoyu = Math.floor((GAME_WIDTH - BOARD_PADDING * 2) / ayar.boyut)
    this.secili = -1
    setChip('remaining', this.oyun.kalan)
    setChip('timer', '0:00')
    this.skorGoster(0)
    this.ciz()
  }

  private x(t: number): number {
    return BOARD_PADDING + t * this.hucreBoyu + this.hucreBoyu / 2
  }

  private y(s: number): number {
    return BOARD_PADDING + s * this.hucreBoyu + this.hucreBoyu / 2
  }

  private dokun(p: Phaser.Input.Pointer): void {
    if (this.bitti) return
    const t = Math.round((p.worldX - BOARD_PADDING - this.hucreBoyu / 2) / this.hucreBoyu)
    const s = Math.round((p.worldY - BOARD_PADDING - this.hucreBoyu / 2) / this.hucreBoyu)
    const index = this.oyun.adaBul(s, t)
    if (index < 0) return
    this.sayac.basla()

    if (this.secili < 0 || this.secili === index) {
      this.secili = this.secili === index ? -1 : index
      sesler.tik()
      this.ciz()
      return
    }

    if (!this.oyun.koprulesDegistir(this.secili, index)) {
      sesler.yanlis()
      this.secili = index
      this.ciz()
      return
    }

    sesler.tik()
    this.secili = -1
    setChip('remaining', this.oyun.kalan)
    this.ciz()

    if (this.oyun.bitti) {
      const skor = skorHesapla(this.zorluk, this.sayac.saniye)
      this.turuBitir({
        baslik: 'Bütün adaları bağladın! 🎉',
        ozet: `${ZORLUKLAR[this.zorluk].ad} · ${this.sayac.yazi} · Skor: ${skor}`,
        skor,
      })
    }
  }

  private ciz(): void {
    this.cizim.clear()
    this.katman.removeAll(true)

    this.cizim.lineStyle(KOPRU_KALINLIK, COLORS.KOPRU, 1)
    for (const k of this.oyun.koprular) {
      const A = this.oyun.adalar[k.a]
      const B = this.oyun.adalar[k.b]
      const yatay = A.satir === B.satir
      const kaymalar = k.adet === 1 ? [0] : [-KOPRU_ARALIK, KOPRU_ARALIK]
      for (const kayma of kaymalar) {
        this.cizim.lineBetween(
          this.x(A.sutun) + (yatay ? 0 : kayma),
          this.y(A.satir) + (yatay ? kayma : 0),
          this.x(B.sutun) + (yatay ? 0 : kayma),
          this.y(B.satir) + (yatay ? kayma : 0),
        )
      }
    }

    const yaricap = this.hucreBoyu * ADA_ORAN
    this.oyun.adalar.forEach((ada, i) => {
      const derece = this.oyun.derece(i)
      const renk = derece === ada.hedef ? COLORS.ADA_TAMAM : derece > ada.hedef ? COLORS.ADA_FAZLA : COLORS.ADA
      const daire = this.add.circle(this.x(ada.sutun), this.y(ada.satir), yaricap, renk)
      if (this.secili === i) daire.setStrokeStyle(3, 0xffffff)
      this.katman.add(daire)
      this.katman.add(
        this.add
          .text(this.x(ada.sutun), this.y(ada.satir), String(ada.hedef), {
            fontFamily: FONT_FAMILY,
            fontSize: `${Math.round(yaricap * 1.1)}px`,
            fontStyle: 'bold',
            color: COLORS.YAZI,
          })
          .setOrigin(0.5),
      )
    })
  }
}
