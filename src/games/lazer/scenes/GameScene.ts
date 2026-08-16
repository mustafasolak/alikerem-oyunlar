import * as Phaser from 'phaser'

import { TemelSahne } from '../../../shared/TemelSahne.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { butonGrubu, setChip } from '../../../shared/dom.ts'
import { LazerAgi } from '../../../shared/motorlar/LazerAgi.ts'
import {
  BOARD_PADDING,
  COLORS,
  GAME_HEIGHT,
  GAME_WIDTH,
  ISIN_KALINLIK,
  KAZANMA_BASLIGI,
  VARSAYILAN_ZORLUK,
  ZORLUKLAR,
  skorHesapla,
  type Zorluk,
} from '../config/constants.ts'

export class GameScene extends TemelSahne {
  private oyun!: LazerAgi
  private zorluk: Zorluk = VARSAYILAN_ZORLUK
  private katman!: Phaser.GameObjects.Container
  private cizim!: Phaser.GameObjects.Graphics
  private hucreBoyu = 0
  private ofset = 0

  constructor() {
    super('lazer')
  }

  protected kur(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(14)
    this.katman = this.add.container(0, 0)
    this.cizim = this.add.graphics()
    butonGrubu('toolbar', 'level', (v) => {
      this.zorluk = v as Zorluk
      this.yenidenBasla()
    })
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.dokun(p))
  }

  protected yeniOyun(): void {
    const ayar = ZORLUKLAR[this.zorluk]
    this.oyun = new LazerAgi(ayar.boyut, ayar.ayna)
    this.hucreBoyu = Math.floor((GAME_WIDTH - BOARD_PADDING * 2) / ayar.boyut)
    this.ofset = (GAME_WIDTH - ayar.boyut * this.hucreBoyu) / 2

    this.katman.removeAll(true)
    for (let s = 0; s < ayar.boyut; s++) {
      for (let t = 0; t < ayar.boyut; t++) {
        this.katman.add(
          this.add.rectangle(this.x(t), this.y(s), this.hucreBoyu - 3, this.hucreBoyu - 3, COLORS.HUCRE).setRounded(5),
        )
      }
    }

    setChip('moves', 0)
    setChip('timer', '0:00')
    this.skorGoster(0)
    this.ciz()
  }

  private x(t: number): number {
    return this.ofset + t * this.hucreBoyu + this.hucreBoyu / 2
  }

  private y(s: number): number {
    return this.ofset + s * this.hucreBoyu + this.hucreBoyu / 2
  }

  private dokun(p: Phaser.Input.Pointer): void {
    if (this.bitti) return
    const t = Math.floor((p.worldX - this.ofset) / this.hucreBoyu)
    const s = Math.floor((p.worldY - this.ofset) / this.hucreBoyu)
    if (!this.oyun.cevir(s, t)) return

    this.sayac.basla()
    sesler.tik()
    setChip('moves', this.oyun.hamle)
    this.ciz()

    if (this.oyun.bitti) {
      const skor = skorHesapla(this.zorluk, this.oyun.hamle, this.sayac.saniye)
      this.turuBitir({
        baslik: KAZANMA_BASLIGI,
        ozet: `${ZORLUKLAR[this.zorluk].ad} · ${this.oyun.hamle} hamle · ${this.sayac.yazi} · Skor: ${skor}`,
        skor,
      })
    }
  }

  private ciz(): void {
    this.cizim.clear()
    const yol = this.oyun.isinYolu()
    const vurulan = new Set(yol.map((k) => `${k.satir},${k.sutun}`))

    // Işın yolu
    this.cizim.lineStyle(ISIN_KALINLIK, COLORS.ISIN, 0.95)
    let onceX = this.x(this.oyun.kaynak.sutun)
    let onceY = this.y(this.oyun.kaynak.satir)
    for (const k of yol) {
      const nx = this.x(k.sutun)
      const ny = this.y(k.satir)
      this.cizim.lineBetween(onceX, onceY, nx, ny)
      onceX = nx
      onceY = ny
    }

    // Hedefler
    for (const h of this.oyun.hedefler) {
      const vuruldu = vurulan.has(`${h.satir},${h.sutun}`)
      this.cizim.fillStyle(vuruldu ? COLORS.HEDEF_VURULDU : COLORS.HEDEF, 1)
      this.cizim.fillCircle(this.x(h.sutun), this.y(h.satir), this.hucreBoyu * 0.22)
    }

    // Aynalar: '/' ya da '\\' çizgisi
    this.cizim.lineStyle(Math.max(3, this.hucreBoyu * 0.12), COLORS.AYNA, 1)
    for (const a of this.oyun.aynalar) {
      const cx = this.x(a.sutun)
      const cy = this.y(a.satir)
      const r = this.hucreBoyu * 0.32
      if (a.yon === 'egik') this.cizim.lineBetween(cx - r, cy + r, cx + r, cy - r)
      else this.cizim.lineBetween(cx - r, cy - r, cx + r, cy + r)
    }

    // Kaynak
    this.cizim.fillStyle(COLORS.KAYNAK, 1)
    this.cizim.fillCircle(this.x(this.oyun.kaynak.sutun), this.y(this.oyun.kaynak.satir), this.hucreBoyu * 0.16)
  }
}
