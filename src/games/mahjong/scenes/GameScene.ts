import * as Phaser from 'phaser'

import { TemelSahne } from '../../../shared/TemelSahne.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { setChip } from '../../../shared/dom.ts'
import {
  COLORS,
  FONT_FAMILY,
  GAME_HEIGHT,
  GAME_WIDTH,
  SATIR,
  SUTUN,
  TAS_GENISLIK,
  TAS_YUKSEKLIK,
  UST_BOSLUK,
  skorHesapla,
} from '../config/constants.ts'
import { Mahjong } from '../systems/Mahjong.ts'

export class GameScene extends TemelSahne {
  private readonly oyun = new Mahjong()
  private katman!: Phaser.GameObjects.Container

  constructor() {
    super('mahjong')
  }

  protected kur(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(14)
    this.katman = this.add.container(0, 0)
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.dokun(p))
  }

  protected yeniOyun(): void {
    this.oyun.dagit()
    setChip('remaining', this.oyun.kalan)
    setChip('timer', '0:00')
    this.skorGoster(0)
    this.ciz()
  }

  private solX(): number {
    return (GAME_WIDTH - SUTUN * TAS_GENISLIK) / 2
  }

  private x(t: number): number {
    return this.solX() + t * TAS_GENISLIK + TAS_GENISLIK / 2
  }

  private y(s: number): number {
    return UST_BOSLUK + s * TAS_YUKSEKLIK + TAS_YUKSEKLIK / 2
  }

  private dokun(p: Phaser.Input.Pointer): void {
    if (this.bitti) return
    const t = Math.floor((p.worldX - this.solX()) / TAS_GENISLIK)
    const s = Math.floor((p.worldY - UST_BOSLUK) / TAS_YUKSEKLIK)
    if (s < 0 || s >= SATIR || t < 0 || t >= SUTUN) return

    const sonuc = this.oyun.sec(this.oyun.index(s, t))
    if (sonuc === 'yok') {
      sesler.yanlis()
      return
    }
    this.sayac.basla()

    if (sonuc === 'eslesti') {
      sesler.dogru()
      setChip('remaining', this.oyun.kalan)
      this.skorGoster(this.oyun.eslesenCift * 120)
    } else sesler.tik()
    this.ciz()

    if (this.oyun.bitti) {
      const skor = skorHesapla(this.oyun.eslesenCift, this.sayac.saniye)
      this.turuBitir({
        baslik: 'Tahtayı boşalttın! 🎉',
        ozet: `${this.oyun.eslesenCift} çift · ${this.sayac.yazi} · Skor: ${skor}`,
        skor,
      })
    } else if (!this.oyun.hamleVarMi) {
      // Kilitlenme: kalanları karıştır, oyun sürsün
      this.oyun.karistirKalanlari()
      sesler.kaydir()
      this.ciz()
    }
  }

  private ciz(): void {
    this.katman.removeAll(true)
    for (let s = 0; s < SATIR; s++) {
      for (let t = 0; t < SUTUN; t++) {
        const index = this.oyun.index(s, t)
        const tas = this.oyun.taslar[index]
        if (!tas || tas.alindi) continue

        const serbest = this.oyun.serbestMi(index)
        const secili = this.oyun.secili === index
        const kutu = this.add
          .rectangle(
            this.x(t),
            this.y(s),
            TAS_GENISLIK - 4,
            TAS_YUKSEKLIK - 6,
            secili ? COLORS.TAS_SECILI : serbest ? COLORS.TAS : COLORS.TAS_KILITLI,
          )
          .setRounded(6)
          .setStrokeStyle(1, 0x065f46, 0.5)
        this.katman.add(kutu)
        this.katman.add(
          this.add
            .text(this.x(t), this.y(s), tas.simge, { fontFamily: FONT_FAMILY, fontSize: '24px' })
            .setOrigin(0.5)
            .setAlpha(serbest ? 1 : 0.55),
        )
      }
    }
  }
}
