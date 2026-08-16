import * as Phaser from 'phaser'

import { KATMAN, acikTon, nisanIzi, top } from '../../../shared/Gorsel.ts'
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
  PATLAMA_SURESI,
  SPIRAL_DIS_YARICAP,
  SPIRAL_IC_YARICAP,
  SPIRAL_TUR,
  TOP_ARALIK,
  TOP_PUANI,
  TOP_R,
  TOP_RENKLERI,
  UCUS_SURESI,
} from '../config/constants.ts'
import { ZumaZinciri } from '../systems/ZumaZinciri.ts'

export class GameScene extends TemelSahne {
  private readonly oyun = new ZumaZinciri(BASLANGIC_TOP)
  private topKatmani!: Phaser.GameObjects.Container
  private yolCizim!: Phaser.GameObjects.Graphics
  private nisanCizim!: Phaser.GameObjects.Graphics
  private aticiKatmani!: Phaser.GameObjects.Container
  /** Yol noktaları: eşit aralıklı, toplar bunlara oturur. */
  private yol: { x: number; y: number }[] = []
  private birikim = 0
  private skor = 0
  private atisSuruyor = false

  constructor() {
    super('zuma')
  }

  protected kur(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(14)
    this.yoluHesapla()

    this.yolCizim = this.add.graphics().setDepth(KATMAN.IZGARA)
    this.topKatmani = this.add.container(0, 0).setDepth(KATMAN.ICERIK)
    this.nisanCizim = this.add.graphics().setDepth(KATMAN.NISAN)
    this.aticiKatmani = this.add.container(0, 0).setDepth(KATMAN.EFEKT)

    this.yoluCiz()
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => this.nisanla(p))
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      this.nisanla(p)
      this.at(p)
    })
  }

  update(_time: number, delta: number): void {
    if (this.bitti || this.atisSuruyor) return
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
    this.atisSuruyor = false
    this.nisanCizim.clear()
    setChip('chain', this.oyun.uzunluk)
    this.skorGoster(0)
    this.ciz()
  }

  /**
   * Spirali eşit aralıklı noktalara böler. Böylece toplar birbirine değer;
   * açıya göre yerleştirmede dışta seyrek, içte sık olma sorunu kalkar.
   */
  private yoluHesapla(): void {
    const ham: { x: number; y: number }[] = []
    const adim = 0.01
    for (let u = 0; u <= 1; u += adim) {
      const aci = u * SPIRAL_TUR * Math.PI * 2
      const yaricap = SPIRAL_DIS_YARICAP - u * (SPIRAL_DIS_YARICAP - SPIRAL_IC_YARICAP)
      ham.push({ x: ATICI_X + Math.cos(aci) * yaricap, y: ATICI_Y + Math.sin(aci) * yaricap })
    }

    this.yol = [ham[0]]
    let birikim = 0
    for (let i = 1; i < ham.length; i++) {
      const a = ham[i - 1]
      const b = ham[i]
      const uzunluk = Math.hypot(b.x - a.x, b.y - a.y)
      let mesafe = TOP_ARALIK - birikim
      while (mesafe < uzunluk) {
        const oran = mesafe / uzunluk
        this.yol.push({ x: a.x + (b.x - a.x) * oran, y: a.y + (b.y - a.y) * oran })
        mesafe += TOP_ARALIK
      }
      birikim = (birikim + uzunluk) % TOP_ARALIK
    }
  }

  private konum(index: number): { x: number; y: number } {
    return this.yol[Math.min(index, this.yol.length - 1)]
  }

  private yoluCiz(): void {
    this.yolCizim.clear()
    // Yol şeridi: kalın koyu bant + ince kenar
    this.yolCizim.lineStyle(TOP_R * 2 + 10, COLORS.YOL_KENAR, 1)
    for (let i = 1; i < this.yol.length; i++) {
      this.yolCizim.lineBetween(this.yol[i - 1].x, this.yol[i - 1].y, this.yol[i].x, this.yol[i].y)
    }
    this.yolCizim.lineStyle(TOP_R * 2 + 2, COLORS.YOL, 1)
    for (let i = 1; i < this.yol.length; i++) {
      this.yolCizim.lineBetween(this.yol[i - 1].x, this.yol[i - 1].y, this.yol[i].x, this.yol[i].y)
    }
    // Zincirin gittiği ağız
    const son = this.yol[this.yol.length - 1]
    this.yolCizim.fillStyle(COLORS.AGIZ, 1)
    this.yolCizim.fillCircle(son.x, son.y, TOP_R + 6)
  }

  /** Tıklanan yöne en yakın zincir konumunu bulur. */
  private hedefIndex(x: number, y: number): number {
    let enYakin = -1
    let enKisa = TOP_ARALIK * 2.2
    for (let i = 0; i <= this.oyun.uzunluk; i++) {
      const k = this.konum(i)
      const d = Math.hypot(k.x - x, k.y - y)
      if (d < enKisa) {
        enKisa = d
        enYakin = i
      }
    }
    return enYakin
  }

  private nisanla(p: Phaser.Input.Pointer): void {
    this.nisanCizim.clear()
    if (this.bitti || this.atisSuruyor) return

    const index = this.hedefIndex(p.worldX, p.worldY)
    if (index < 0) return
    const hedef = this.konum(index)
    const renk = TOP_RENKLERI[this.oyun.siradaki % TOP_RENKLERI.length]

    nisanIzi(
      this.nisanCizim,
      [{ x: ATICI_X, y: ATICI_Y }, hedef],
      COLORS.NISAN,
      10,
      2.6,
      0.6,
    )
    this.nisanCizim.lineStyle(3, renk, 0.9)
    this.nisanCizim.strokeCircle(hedef.x, hedef.y, TOP_R + 3)
  }

  private at(p: Phaser.Input.Pointer): void {
    if (this.bitti || this.oyun.bitti || this.atisSuruyor) return
    const index = this.hedefIndex(p.worldX, p.worldY)
    if (index < 0) return

    this.atisSuruyor = true
    this.sayac.basla()
    this.nisanCizim.clear()
    const renk = this.oyun.siradaki
    const hedef = this.konum(index)

    // Top atıcıdan hedefe uçsun
    const ucan = top(this, ATICI_X, ATICI_Y, TOP_R, TOP_RENKLERI[renk % TOP_RENKLERI.length])
    ucan.setDepth(KATMAN.EFEKT)
    sesler.tik()

    this.tweens.add({
      targets: ucan,
      x: hedef.x,
      y: hedef.y,
      duration: UCUS_SURESI,
      ease: 'Quad.easeOut',
      onComplete: () => {
        ucan.destroy()
        this.yerlestir(index, renk)
      },
    })
  }

  private yerlestir(index: number, renk: number): void {
    const sonuc = this.oyun.ekle(index, renk)
    if (sonuc.patlayan > 0) {
      this.skor += sonuc.patlayan * TOP_PUANI * sonuc.zincirleme
      sesler.satir(Math.min(4, sonuc.zincirleme))
      this.hud.showGain(sonuc.patlayan * TOP_PUANI * sonuc.zincirleme)
      const k = this.konum(index)
      const efekt = this.add.circle(k.x, k.y, TOP_R, 0xffffff, 0.7).setDepth(KATMAN.EFEKT)
      this.tweens.add({
        targets: efekt,
        scale: 2.2,
        alpha: 0,
        duration: PATLAMA_SURESI,
        onComplete: () => efekt.destroy(),
      })
    }

    setChip('chain', this.oyun.uzunluk)
    this.skorGoster(this.skor)
    this.ciz()
    this.birikim = 0

    this.time.delayedCall(PATLAMA_SURESI, () => {
      this.atisSuruyor = false
      if (this.oyun.bitti) {
        const skor = this.skor + this.oyun.patlatilan * KALAN_PUANI
        this.turuBitir({ baslik: 'Zinciri temizledin! 🎉', ozet: `${this.oyun.patlatilan} top · Skor: ${skor}`, skor })
      }
    })
  }

  private ciz(): void {
    this.topKatmani.removeAll(true)
    this.oyun.toplar.forEach((renk, i) => {
      const k = this.konum(i)
      this.topKatmani.add(top(this, k.x, k.y, TOP_R, TOP_RENKLERI[renk % TOP_RENKLERI.length]))
    })

    this.aticiKatmani.removeAll(true)
    this.aticiKatmani.add(this.add.circle(ATICI_X, ATICI_Y, TOP_R + 9, COLORS.ATICI))
    this.aticiKatmani.add(
      this.add.circle(ATICI_X, ATICI_Y, TOP_R + 9, 0x000000, 0).setStrokeStyle(2, acikTon(COLORS.ATICI, 0.5)),
    )
    this.aticiKatmani.add(top(this, ATICI_X, ATICI_Y, TOP_R - 1, TOP_RENKLERI[this.oyun.siradaki % TOP_RENKLERI.length]))
  }
}
