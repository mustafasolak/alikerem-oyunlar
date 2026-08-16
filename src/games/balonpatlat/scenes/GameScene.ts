import * as Phaser from 'phaser'

import { KATMAN, acikTon, nisanIzi, sekenYol, top } from '../../../shared/Gorsel.ts'
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
  DUSME_SURESI,
  GAME_HEIGHT,
  GAME_WIDTH,
  KALAN_ATIS_PUANI,
  PATLAMA_SURESI,
  SATIR,
  SOL_BOSLUK,
  SUTUN,
  UCUS_SURESI,
  UST_BOSLUK,
} from '../config/constants.ts'
import { BalonAgi } from '../systems/BalonAgi.ts'

export class GameScene extends TemelSahne {
  private readonly oyun = new BalonAgi()
  private balonKatmani!: Phaser.GameObjects.Container
  private nisanCizim!: Phaser.GameObjects.Graphics
  private aticiKatmani!: Phaser.GameObjects.Container
  private ucanBalon?: Phaser.GameObjects.Container
  private kalanAtis = ATIS_HAKKI
  private atisSuruyor = false
  private skor = 0

  constructor() {
    super('balonpatlat')
  }

  protected kur(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(14)
    // Tavan çizgisi: balonların tutunduğu yer
    this.add.rectangle(GAME_WIDTH / 2, UST_BOSLUK - 8, GAME_WIDTH - 24, 5, COLORS.TAVAN).setRounded(3)

    this.balonKatmani = this.add.container(0, 0).setDepth(KATMAN.ICERIK)
    this.nisanCizim = this.add.graphics().setDepth(KATMAN.NISAN)
    this.aticiKatmani = this.add.container(0, 0).setDepth(KATMAN.EFEKT)

    // Parmak/fare hareket ettikçe nişan izi güncellenir
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => this.nisanla(p))
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      this.nisanla(p)
      this.at(p)
    })
  }

  protected yeniOyun(): void {
    this.oyun.reset()
    this.kalanAtis = ATIS_HAKKI
    this.atisSuruyor = false
    this.skor = 0
    this.ucanBalon?.destroy()
    this.ucanBalon = undefined
    this.nisanCizim.clear()
    setChip('shots', this.kalanAtis)
    this.skorGoster(0)
    this.ciz()
  }

  private x(s: number, t: number): number {
    return SOL_BOSLUK + (this.oyun.kaydirmaliMi(s) ? BALON_R : 0) + t * ADIM_X + BALON_R
  }

  private y(s: number): number {
    return UST_BOSLUK + s * ADIM_Y + BALON_R
  }

  /** Işını ilerletip ilk dolu balona değdiği yeri ve boş komşuyu bulur. */
  private hedefHesapla(aciX: number, aciY: number): {
    hedef: { satir: number; sutun: number } | null
    yol: { x: number; y: number }[]
  } {
    let bulunan: { satir: number; sutun: number } | null = null

    const yol = sekenYol(
      GAME_WIDTH / 2,
      ATICI_Y,
      aciX,
      aciY,
      BALON_R + 8,
      GAME_WIDTH - BALON_R - 8,
      UST_BOSLUK,
      (px, py) => {
        for (let s = 0; s < SATIR; s++) {
          for (let t = 0; t < SUTUN; t++) {
            if (!this.oyun.dolu(s, t)) continue
            if (Math.hypot(px - this.x(s, t), py - this.y(s)) > BALON_R * 1.7) continue
            let enIyi: { satir: number; sutun: number } | null = null
            let enKisa = Infinity
            for (const komsu of this.oyun.komsular(s, t)) {
              if (this.oyun.dolu(komsu.satir, komsu.sutun)) continue
              const d = Math.hypot(px - this.x(komsu.satir, komsu.sutun), py - this.y(komsu.satir))
              if (d < enKisa) {
                enKisa = d
                enIyi = komsu
              }
            }
            bulunan = enIyi
            return true
          }
        }
        return false
      },
    )

    if (!bulunan) {
      // Tavana ulaştı: en yakın üst satır hücresi
      const son = yol[yol.length - 1]
      const t = Math.max(0, Math.min(SUTUN - 1, Math.round((son.x - SOL_BOSLUK - BALON_R) / ADIM_X)))
      if (!this.oyun.dolu(0, t)) bulunan = { satir: 0, sutun: t }
    }
    return { hedef: bulunan, yol }
  }

  /** Nişan izi: kesik çizgi + hedef hücrede hayalet balon. */
  private nisanla(p: Phaser.Input.Pointer): void {
    this.nisanCizim.clear()
    if (this.bitti || this.atisSuruyor || this.kalanAtis <= 0) return

    const aciX = p.worldX - GAME_WIDTH / 2
    const aciY = p.worldY - ATICI_Y
    if (aciY > -30) return

    const { hedef, yol } = this.hedefHesapla(aciX, aciY)
    const renk = BALON_RENKLERI[this.oyun.siradaki % BALON_RENKLERI.length]
    nisanIzi(this.nisanCizim, yol, COLORS.NISAN, 11, 3, 0.55)

    if (hedef) {
      // Hayalet balon: nereye oturacağı belli olsun
      this.nisanCizim.lineStyle(3, renk, 0.9)
      this.nisanCizim.strokeCircle(this.x(hedef.satir, hedef.sutun), this.y(hedef.satir), BALON_R - 2)
      this.nisanCizim.fillStyle(renk, 0.22)
      this.nisanCizim.fillCircle(this.x(hedef.satir, hedef.sutun), this.y(hedef.satir), BALON_R - 2)
    }
  }

  private at(p: Phaser.Input.Pointer): void {
    if (this.bitti || this.atisSuruyor || this.kalanAtis <= 0) return
    const aciX = p.worldX - GAME_WIDTH / 2
    const aciY = p.worldY - ATICI_Y
    if (aciY > -30) return

    const { hedef, yol } = this.hedefHesapla(aciX, aciY)
    if (!hedef) return

    this.atisSuruyor = true
    this.sayac.basla()
    const renk = this.oyun.siradaki
    sesler.tik()

    // Balon yolu izleyerek uçsun
    const ucan = top(this, GAME_WIDTH / 2, ATICI_Y, BALON_R - 2, BALON_RENKLERI[renk % BALON_RENKLERI.length])
    ucan.setDepth(KATMAN.EFEKT)
    this.ucanBalon = ucan
    this.nisanCizim.clear()

    const hedefX = this.x(hedef.satir, hedef.sutun)
    const hedefY = this.y(hedef.satir)
    const noktalar = [...yol, { x: hedefX, y: hedefY }]
    let adim = 0
    const sonraki = (): void => {
      adim++
      if (adim >= noktalar.length) {
        ucan.destroy()
        this.ucanBalon = undefined
        this.yerlestir(hedef, renk)
        return
      }
      const n = noktalar[adim]
      this.tweens.add({
        targets: ucan,
        x: n.x,
        y: n.y,
        duration: Math.max(28, UCUS_SURESI / noktalar.length),
        ease: 'Linear',
        onComplete: sonraki,
      })
    }
    sonraki()
  }

  private yerlestir(hedef: { satir: number; sutun: number }, renk: number): void {
    const sonuc = this.oyun.yerlestir(hedef.satir, hedef.sutun, renk)
    this.kalanAtis--
    setChip('shots', this.kalanAtis)

    const patlayan = sonuc.patlayanlar.length + sonuc.dusenler.length
    if (patlayan > 0) {
      this.skor += patlayan * BALON_PUANI
      sesler.satir(Math.min(4, Math.ceil(patlayan / 3)))
      this.hud.showGain(patlayan * BALON_PUANI)
      this.patlamaEfekti(sonuc.patlayanlar, sonuc.dusenler)
    } else sesler.tik()

    this.skorGoster(this.skor)
    this.ciz()

    this.time.delayedCall(patlayan > 0 ? DUSME_SURESI : PATLAMA_SURESI, () => {
      this.atisSuruyor = false
      if (this.oyun.temiz) {
        const skor = this.skor + this.kalanAtis * KALAN_ATIS_PUANI
        this.turuBitir({ baslik: 'Tahtayı temizledin! 🎉', ozet: `${this.kalanAtis} atış kaldı · Skor: ${skor}`, skor })
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

  /** Patlayanlar yerinde küçülür, kopanlar aşağı düşer. */
  private patlamaEfekti(
    patlayanlar: { satir: number; sutun: number }[],
    dusenler: { satir: number; sutun: number }[],
  ): void {
    for (const k of patlayanlar) {
      const efekt = this.add
        .circle(this.x(k.satir, k.sutun), this.y(k.satir), BALON_R - 2, 0xffffff, 0.7)
        .setDepth(KATMAN.EFEKT)
      this.tweens.add({ targets: efekt, scale: 1.5, alpha: 0, duration: PATLAMA_SURESI, onComplete: () => efekt.destroy() })
    }
    for (const k of dusenler) {
      const efekt = this.add
        .circle(this.x(k.satir, k.sutun), this.y(k.satir), BALON_R - 3, 0xffffff, 0.35)
        .setDepth(KATMAN.EFEKT)
      this.tweens.add({
        targets: efekt,
        y: GAME_HEIGHT + 40,
        alpha: 0.2,
        duration: DUSME_SURESI,
        ease: 'Quad.easeIn',
        onComplete: () => efekt.destroy(),
      })
    }
  }

  private ciz(): void {
    this.balonKatmani.removeAll(true)
    for (let s = 0; s < SATIR; s++) {
      for (let t = 0; t < SUTUN; t++) {
        const renk = this.oyun.izgara[this.oyun.index(s, t)]
        if (renk === -1) continue
        this.balonKatmani.add(
          top(this, this.x(s, t), this.y(s), BALON_R - 2, BALON_RENKLERI[renk % BALON_RENKLERI.length]),
        )
      }
    }

    // Atıcı: taban + namlu + sıradaki balon
    this.aticiKatmani.removeAll(true)
    this.aticiKatmani.add(
      this.add.rectangle(GAME_WIDTH / 2, ATICI_Y + 16, 92, 22, COLORS.ATICI).setRounded(11),
    )
    this.aticiKatmani.add(
      top(this, GAME_WIDTH / 2, ATICI_Y, BALON_R, BALON_RENKLERI[this.oyun.siradaki % BALON_RENKLERI.length]),
    )
    this.aticiKatmani.add(
      this.add
        .circle(GAME_WIDTH / 2, ATICI_Y, BALON_R + 5, acikTon(COLORS.ATICI, 0.4), 0)
        .setStrokeStyle(2, COLORS.NISAN, 0.4),
    )
  }
}
