import * as Phaser from 'phaser'

import { TemelSahne } from '../../../shared/TemelSahne.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { setChip } from '../../../shared/dom.ts'
import {
  BOYUT,
  COLORS,
  GAME_HEIGHT,
  GAME_WIDTH,
  HUCRE,
  SECENEK_HUCRE,
  SECENEK_SAYISI,
  SECENEK_Y,
  TAHTA_UST,
  TUR_SAYISI,
  skorHesapla,
} from '../config/constants.ts'
import { ResimTamamla } from '../systems/ResimTamamla.ts'

export class GameScene extends TemelSahne {
  private readonly oyun = new ResimTamamla()
  private katman!: Phaser.GameObjects.Container
  private tur = 1

  constructor() {
    super('resimtamamla')
  }

  protected kur(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(14)
    this.katman = this.add.container(0, 0)
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.dokun(p))
  }

  protected yeniOyun(): void {
    this.tur = 1
    this.oyun.hata = 0
    this.oyun.yeniTur()
    setChip('round', `${this.tur}/${TUR_SAYISI}`)
    setChip('mistakes', 0)
    this.skorGoster(0)
    this.ciz()
  }

  private solX(): number {
    return (GAME_WIDTH - BOYUT * HUCRE) / 2
  }

  private secenekX(i: number): number {
    return (GAME_WIDTH / (SECENEK_SAYISI + 1)) * (i + 1)
  }

  private dokun(p: Phaser.Input.Pointer): void {
    if (this.bitti) return
    if (Math.abs(p.worldY - SECENEK_Y) > SECENEK_HUCRE + 12) return
    this.sayac.basla()

    for (let i = 0; i < SECENEK_SAYISI; i++) {
      if (Math.abs(p.worldX - this.secenekX(i)) > SECENEK_HUCRE) continue

      if (!this.oyun.sec(i)) {
        sesler.yanlis()
        this.cameras.main.shake(130, 0.005)
        setChip('mistakes', this.oyun.hata)
        return
      }

      sesler.dogru()
      if (this.tur >= TUR_SAYISI) {
        const skor = skorHesapla(TUR_SAYISI, this.oyun.hata)
        this.turuBitir({
          baslik: 'Hepsini tamamladın! 🎉',
          ozet: `${TUR_SAYISI} tur · ${this.oyun.hata} hata · Skor: ${skor}`,
          skor,
        })
        return
      }

      this.tur++
      this.oyun.yeniTur()
      setChip('round', `${this.tur}/${TUR_SAYISI}`)
      this.skorGoster(skorHesapla(this.tur - 1, this.oyun.hata))
      this.ciz()
      return
    }
  }

  private ciz(): void {
    this.katman.removeAll(true)
    const sol = this.solX()

    for (let s = 0; s < BOYUT; s++) {
      for (let t = 0; t < BOYUT; t++) {
        const eksik = this.oyun.eksikMi(s, t)
        this.katman.add(
          this.add
            .rectangle(
              sol + t * HUCRE + HUCRE / 2,
              TAHTA_UST + s * HUCRE + HUCRE / 2,
              HUCRE - 3,
              HUCRE - 3,
              eksik ? COLORS.EKSIK : this.oyun.desen[this.oyun.index(s, t)],
            )
            .setRounded(5),
        )
      }
    }

    this.oyun.secenekler.forEach((parca, i) => {
      const cx = this.secenekX(i)
      this.katman.add(
        this.add
          .rectangle(cx, SECENEK_Y, SECENEK_HUCRE * 2 + 12, SECENEK_HUCRE * 2 + 12, 0x000000, 0)
          .setStrokeStyle(2, COLORS.SECENEK_CERCEVE)
          .setRounded(8),
      )
      parca.forEach((renk, j) => {
        const dx = (j % 2) - 0.5
        const dy = Math.floor(j / 2) - 0.5
        this.katman.add(
          this.add
            .rectangle(cx + dx * SECENEK_HUCRE, SECENEK_Y + dy * SECENEK_HUCRE, SECENEK_HUCRE - 2, SECENEK_HUCRE - 2, renk)
            .setRounded(4),
        )
      })
    })
  }
}
