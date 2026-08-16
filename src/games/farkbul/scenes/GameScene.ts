import * as Phaser from 'phaser'

import { TemelSahne } from '../../../shared/TemelSahne.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { setChip } from '../../../shared/dom.ts'
import {
  ALT_PANEL_Y,
  COLORS,
  GAME_HEIGHT,
  GAME_WIDTH,
  PANEL_GENISLIK,
  PANEL_YUKSEKLIK,
  SATIR,
  SUTUN,
  UST_PANEL_Y,
  skorHesapla,
} from '../config/constants.ts'
import { FarkBul, type Sekil } from '../systems/FarkBul.ts'

export class GameScene extends TemelSahne {
  private readonly oyun = new FarkBul()
  private katman!: Phaser.GameObjects.Container

  constructor() {
    super('farkbul')
  }

  protected kur(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(14)
    for (const y of [UST_PANEL_Y, ALT_PANEL_Y]) {
      this.add
        .rectangle(GAME_WIDTH / 2, y + PANEL_YUKSEKLIK / 2, PANEL_GENISLIK, PANEL_YUKSEKLIK, COLORS.PANEL)
        .setRounded(12)
    }
    this.katman = this.add.container(0, 0)
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.dokun(p))
  }

  protected yeniOyun(): void {
    this.oyun.reset()
    setChip('found', `0/${this.oyun.farklar.length}`)
    setChip('timer', '0:00')
    this.skorGoster(0)
    this.ciz()
  }

  private hucreBoyu(): number {
    return Math.min(PANEL_GENISLIK / SUTUN, PANEL_YUKSEKLIK / SATIR)
  }

  private x(t: number): number {
    const boyut = this.hucreBoyu()
    return (GAME_WIDTH - SUTUN * boyut) / 2 + t * boyut + boyut / 2
  }

  private y(s: number, panelY: number): number {
    const boyut = this.hucreBoyu()
    return panelY + (PANEL_YUKSEKLIK - SATIR * boyut) / 2 + s * boyut + boyut / 2
  }

  private dokun(p: Phaser.Input.Pointer): void {
    if (this.bitti) return
    const boyut = this.hucreBoyu()
    const panelY = p.worldY < ALT_PANEL_Y ? UST_PANEL_Y : ALT_PANEL_Y
    const t = Math.floor((p.worldX - (GAME_WIDTH - SUTUN * boyut) / 2) / boyut)
    const s = Math.floor((p.worldY - panelY - (PANEL_YUKSEKLIK - SATIR * boyut) / 2) / boyut)
    if (s < 0 || s >= SATIR || t < 0 || t >= SUTUN) return

    this.sayac.basla()
    const index = s * SUTUN + t
    if (this.oyun.dokun(index) === 'dogru') {
      sesler.dogru()
      setChip('found', `${this.oyun.bulunanlar.size}/${this.oyun.farklar.length}`)
      this.ciz()
      if (this.oyun.bitti) {
        const skor = skorHesapla(this.oyun.bulunanlar.size, this.sayac.saniye)
        this.turuBitir({
          baslik: 'Bütün farkları buldun! 🎉',
          ozet: `${this.oyun.farklar.length} fark · ${this.sayac.yazi} · Skor: ${skor}`,
          skor,
        })
      }
    } else {
      sesler.yanlis()
      this.cameras.main.shake(120, 0.004)
    }
  }

  private sekilCiz(sekil: Sekil, x: number, y: number, boyut: number, isaretli: boolean): void {
    const r = boyut * 0.32
    if (sekil.tur === 'daire') this.katman.add(this.add.circle(x, y, r, sekil.renk))
    else if (sekil.tur === 'kare') this.katman.add(this.add.rectangle(x, y, r * 1.8, r * 1.8, sekil.renk).setRounded(4))
    else {
      const ucgen = this.add.triangle(x, y, 0, r, r, -r, -r, -r, sekil.renk)
      this.katman.add(ucgen)
    }
    if (isaretli) {
      this.katman.add(
        this.add.circle(x, y, boyut * 0.45, 0x000000, 0).setStrokeStyle(3, COLORS.BULUNDU),
      )
    }
  }

  private ciz(): void {
    this.katman.removeAll(true)
    const boyut = this.hucreBoyu()

    for (let s = 0; s < SATIR; s++) {
      for (let t = 0; t < SUTUN; t++) {
        const index = s * SUTUN + t
        const isaretli = this.oyun.bulunanlar.has(index)
        this.sekilCiz(this.oyun.ust[index], this.x(t), this.y(s, UST_PANEL_Y), boyut, isaretli)
        this.sekilCiz(this.oyun.alt[index], this.x(t), this.y(s, ALT_PANEL_Y), boyut, isaretli)
      }
    }
  }
}
