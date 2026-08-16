import * as Phaser from 'phaser'

import { TemelSahne } from '../../../shared/TemelSahne.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { setChip } from '../../../shared/dom.ts'
import {
  ATICI_X,
  ATICI_Y,
  BASLANGIC_TOP,
  COLORS,
  GAME_HEIGHT,
  GAME_WIDTH,
  ILERLEME_MS,
  KALAN_PUANI,
  TOP_ARALIK,
  TOP_PUANI,
  TOP_R,
  TOP_RENKLERI,
} from '../config/constants.ts'
import { ZumaZinciri } from '../systems/ZumaZinciri.ts'

export class GameScene extends TemelSahne {
  private readonly oyun = new ZumaZinciri(BASLANGIC_TOP)
  private katman!: Phaser.GameObjects.Container
  private yolCizim!: Phaser.GameObjects.Graphics
  private birikim = 0
  private skor = 0

  constructor() {
    super('zuma')
  }

  protected kur(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(14)
    this.yolCizim = this.add.graphics()
    this.katman = this.add.container(0, 0)
    this.yoluCiz()
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.at(p))
  }

  update(_time: number, delta: number): void {
    if (this.bitti) return
    this.birikim += delta
    if (this.birikim < ILERLEME_MS) return
    this.birikim = 0

    this.oyun.ilerlet()
    setChip('chain', this.oyun.uzunluk)
    this.ciz()

    if (this.oyun.kaybetti) {
      this.turuBitir({
        baslik: 'Zincir taştı',
        ozet: `${this.oyun.patlatilan} top patlattın · Skor: ${this.skor}`,
        skor: this.skor,
        kazandi: false,
      })
    }
  }

  protected yeniOyun(): void {
    this.oyun.reset(BASLANGIC_TOP)
    this.birikim = 0
    this.skor = 0
    setChip('chain', this.oyun.uzunluk)
    this.skorGoster(0)
    this.ciz()
  }

  /** Spiral yol: her top bir açı adımında durur. */
  private konum(index: number): { x: number; y: number } {
    const aci = index * 0.42
    const yaricap = 210 - index * 3.4
    return {
      x: ATICI_X + Math.cos(aci) * Math.max(30, yaricap),
      y: ATICI_Y + Math.sin(aci) * Math.max(30, yaricap),
    }
  }

  private yoluCiz(): void {
    this.yolCizim.clear()
    this.yolCizim.lineStyle(TOP_R * 2 + 6, COLORS.YOL, 1)
    let once = this.konum(0)
    for (let i = 1; i < 60; i++) {
      const su = this.konum(i)
      this.yolCizim.lineBetween(once.x, once.y, su.x, su.y)
      once = su
    }
  }

  private at(p: Phaser.Input.Pointer): void {
    if (this.bitti || this.oyun.bitti) return
    this.sayac.basla()

    // Tıklanan noktaya en yakın zincir konumunu bul
    let enYakin = 0
    let enKisa = Infinity
    for (let i = 0; i <= this.oyun.uzunluk; i++) {
      const k = this.konum(i)
      const d = Math.hypot(k.x - p.worldX, k.y - p.worldY)
      if (d < enKisa) {
        enKisa = d
        enYakin = i
      }
    }
    if (enKisa > TOP_ARALIK * 2.5) return

    const sonuc = this.oyun.ekle(enYakin, this.oyun.siradaki)
    if (sonuc.patlayan > 0) {
      this.skor += sonuc.patlayan * TOP_PUANI * sonuc.zincirleme
      sesler.satir(Math.min(4, sonuc.zincirleme))
      this.hud.showGain(sonuc.patlayan * TOP_PUANI * sonuc.zincirleme)
    } else sesler.tik()

    setChip('chain', this.oyun.uzunluk)
    this.skorGoster(this.skor)
    this.ciz()

    if (this.oyun.bitti) {
      const skor = this.skor + this.oyun.patlatilan * KALAN_PUANI
      this.turuBitir({
        baslik: 'Zinciri temizledin! 🎉',
        ozet: `${this.oyun.patlatilan} top · Skor: ${skor}`,
        skor,
      })
    }
  }

  private ciz(): void {
    this.katman.removeAll(true)
    this.oyun.toplar.forEach((renk, i) => {
      const k = this.konum(i)
      this.katman.add(this.add.circle(k.x, k.y, TOP_R, TOP_RENKLERI[renk % TOP_RENKLERI.length]))
    })
    this.katman.add(this.add.circle(ATICI_X, ATICI_Y, TOP_R + 4, COLORS.ATICI))
    this.katman.add(
      this.add.circle(ATICI_X, ATICI_Y, TOP_R - 2, TOP_RENKLERI[this.oyun.siradaki % TOP_RENKLERI.length]),
    )
  }
}
