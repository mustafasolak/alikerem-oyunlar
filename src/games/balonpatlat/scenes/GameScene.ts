import * as Phaser from 'phaser'

import { TemelSahne } from '../../../shared/TemelSahne.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { setChip } from '../../../shared/dom.ts'
import {
  ADIM_X,
  ADIM_Y,
  ATICI_Y,
  ATIS_HAKKI,
  BALON_PUANI,
  BALON_R,
  BALON_RENKLERI,
  COLORS,
  GAME_HEIGHT,
  GAME_WIDTH,
  KALAN_ATIS_PUANI,
  PATLAMA_SURESI,
  SATIR,
  SUTUN,
  UST_BOSLUK,
} from '../config/constants.ts'
import { BalonAgi } from '../systems/BalonAgi.ts'

export class GameScene extends TemelSahne {
  private readonly oyun = new BalonAgi()
  private katman!: Phaser.GameObjects.Container
  private nisan!: Phaser.GameObjects.Graphics
  private kalanAtis = ATIS_HAKKI
  private atisSuruyor = false
  private skor = 0

  constructor() {
    super('balonpatlat')
  }

  protected kur(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(14)
    this.katman = this.add.container(0, 0)
    this.nisan = this.add.graphics()
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.at(p))
  }

  protected yeniOyun(): void {
    this.oyun.reset()
    this.kalanAtis = ATIS_HAKKI
    this.atisSuruyor = false
    this.skor = 0
    setChip('shots', this.kalanAtis)
    this.skorGoster(0)
    this.ciz()
  }

  private x(s: number, t: number): number {
    const kayma = this.oyun.kaydirmaliMi(s) ? BALON_R : 0
    return 20 + kayma + t * ADIM_X + BALON_R
  }

  private y(s: number): number {
    return UST_BOSLUK + s * ADIM_Y + BALON_R
  }

  /** Işını adım adım ilerletip ilk boş komşu hücreyi bulur (duvarlardan seker). */
  private hedefHucre(aciX: number, aciY: number): { satir: number; sutun: number } | null {
    let px = GAME_WIDTH / 2
    let py = ATICI_Y
    let vx = aciX
    let vy = aciY
    const uzunluk = Math.hypot(vx, vy) || 1
    vx = (vx / uzunluk) * 6
    vy = (vy / uzunluk) * 6

    for (let adim = 0; adim < 1000; adim++) {
      px += vx
      py += vy
      if (px < BALON_R || px > GAME_WIDTH - BALON_R) vx = -vx
      if (py < UST_BOSLUK) break

      // En yakın ızgara hücresi
      for (let s = 0; s < SATIR; s++) {
        for (let t = 0; t < SUTUN; t++) {
          if (!this.oyun.dolu(s, t)) continue
          const d = Math.hypot(px - this.x(s, t), py - this.y(s))
          if (d > BALON_R * 1.6) continue
          // Dolu balona değdi: en yakın boş komşuyu seç
          let enIyi: { satir: number; sutun: number } | null = null
          let enKisa = Infinity
          for (const komsu of this.oyun.komsular(s, t)) {
            if (this.oyun.dolu(komsu.satir, komsu.sutun)) continue
            const dk = Math.hypot(px - this.x(komsu.satir, komsu.sutun), py - this.y(komsu.satir))
            if (dk < enKisa) {
              enKisa = dk
              enIyi = komsu
            }
          }
          return enIyi
        }
      }
    }
    // Tavana ulaştı: en yakın üst satır hücresi
    const t = Math.max(0, Math.min(SUTUN - 1, Math.round((px - 20 - BALON_R) / ADIM_X)))
    return this.oyun.dolu(0, t) ? null : { satir: 0, sutun: t }
  }

  private at(p: Phaser.Input.Pointer): void {
    if (this.bitti || this.atisSuruyor || this.kalanAtis <= 0) return
    const aciX = p.worldX - GAME_WIDTH / 2
    const aciY = p.worldY - ATICI_Y
    if (aciY > -20) return // aşağı doğru atış yok

    const hedef = this.hedefHucre(aciX, aciY)
    if (!hedef) return

    this.atisSuruyor = true
    this.sayac.basla()
    const renk = this.oyun.siradaki
    const sonuc = this.oyun.yerlestir(hedef.satir, hedef.sutun, renk)
    this.kalanAtis--
    setChip('shots', this.kalanAtis)

    const patlayan = sonuc.patlayanlar.length + sonuc.dusenler.length
    if (patlayan > 0) {
      this.skor += patlayan * BALON_PUANI
      sesler.satir(Math.min(4, Math.ceil(patlayan / 3)))
      this.hud.showGain(patlayan * BALON_PUANI)
    } else sesler.tik()

    this.skorGoster(this.skor)
    this.ciz()

    this.time.delayedCall(PATLAMA_SURESI, () => {
      this.atisSuruyor = false
      if (this.oyun.temiz) {
        const skor = this.skor + this.kalanAtis * KALAN_ATIS_PUANI
        this.turuBitir({
          baslik: 'Tahtayı temizledin! 🎉',
          ozet: `${this.kalanAtis} atış kaldı · Skor: ${skor}`,
          skor,
        })
      } else if (this.kalanAtis <= 0) {
        this.turuBitir({
          baslik: 'Atışın bitti',
          ozet: `${this.oyun.kalanBalon} balon kaldı · Skor: ${this.skor}`,
          skor: this.skor,
          kazandi: false,
        })
      }
    })
  }

  private ciz(): void {
    this.katman.removeAll(true)
    for (let s = 0; s < SATIR; s++) {
      for (let t = 0; t < SUTUN; t++) {
        const renk = this.oyun.izgara[this.oyun.index(s, t)]
        if (renk === -1) continue
        this.katman.add(this.add.circle(this.x(s, t), this.y(s), BALON_R - 2, BALON_RENKLERI[renk % BALON_RENKLERI.length]))
      }
    }

    // Atıcı ve sıradaki balon
    this.nisan.clear()
    this.nisan.lineStyle(2, COLORS.NISAN, 0.5)
    this.nisan.lineBetween(GAME_WIDTH / 2, ATICI_Y, GAME_WIDTH / 2, ATICI_Y - 60)
    this.katman.add(
      this.add.circle(GAME_WIDTH / 2, ATICI_Y, BALON_R, BALON_RENKLERI[this.oyun.siradaki % BALON_RENKLERI.length]),
    )
  }
}
