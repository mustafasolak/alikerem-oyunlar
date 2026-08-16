import * as Phaser from 'phaser'

import { TemelSahne } from '../../../shared/TemelSahne.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { butonGrubu, setChip } from '../../../shared/dom.ts'
import {
  COLORS,
  FONT_FAMILY,
  GAME_HEIGHT,
  GAME_WIDTH,
  HEDEF_Y,
  ISLEMLER,
  ISLEM_Y,
  ISLEM_YARICAP,
  SAYI_Y,
  SAYI_YARICAP,
  VARSAYILAN_ZORLUK,
  ZORLUKLAR,
  skorHesapla,
  type Zorluk,
} from '../config/constants.ts'
import { MatematikOyunu, type Islem } from '../systems/MatematikOyunu.ts'

export class GameScene extends TemelSahne {
  private oyun!: MatematikOyunu
  private zorluk: Zorluk = VARSAYILAN_ZORLUK
  private katman!: Phaser.GameObjects.Container

  constructor() {
    super('matematik')
  }

  protected kur(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(14)
    this.katman = this.add.container(0, 0)
    butonGrubu('toolbar', 'level', (v) => {
      this.zorluk = v as Zorluk
      this.yenidenBasla()
    })
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.dokun(p))
  }

  protected yeniOyun(): void {
    const a = ZORLUKLAR[this.zorluk]
    this.oyun = new MatematikOyunu(a.sayiAdedi, a.enBuyuk, a.adim)
    setChip('target', this.oyun.hedef)
    setChip('moves', 0)
    this.skorGoster(0)
    this.ciz()
  }

  private sayiX(i: number, adet: number): number {
    return (GAME_WIDTH / (adet + 1)) * (i + 1)
  }

  private islemX(i: number): number {
    return (GAME_WIDTH / (ISLEMLER.length + 1)) * (i + 1)
  }

  private dokun(p: Phaser.Input.Pointer): void {
    if (this.bitti) return
    this.sayac.basla()

    if (Math.abs(p.worldY - SAYI_Y) < SAYI_YARICAP + 12) {
      for (let i = 0; i < this.oyun.sayilar.length; i++) {
        if (Math.abs(p.worldX - this.sayiX(i, this.oyun.sayilar.length)) < SAYI_YARICAP) {
          this.oyun.sayiSec(i)
          sesler.tik()
          this.sonrasi()
          return
        }
      }
      return
    }

    if (Math.abs(p.worldY - ISLEM_Y) < ISLEM_YARICAP + 12) {
      for (let i = 0; i < ISLEMLER.length; i++) {
        if (Math.abs(p.worldX - this.islemX(i)) < ISLEM_YARICAP) {
          this.oyun.islemSec(ISLEMLER[i] as Islem)
          sesler.tik()
          this.sonrasi()
          return
        }
      }
    }
  }

  private sonrasi(): void {
    setChip('moves', this.oyun.hamle)
    this.ciz()

    if (this.oyun.bitti) {
      const skor = skorHesapla(this.zorluk, this.oyun.hamle)
      this.turuBitir({
        baslik: 'Hedefi tutturdun! 🎉',
        ozet: `${ZORLUKLAR[this.zorluk].ad} · hedef ${this.oyun.hedef} · ${this.oyun.hamle} hamle · Skor: ${skor}`,
        skor,
      })
      return
    }

    if (this.oyun.kaybetti) {
      sesler.yanlis()
      this.hud.showOverlay({
        title: 'Sayılar tükendi',
        text: `Hedef ${this.oyun.hedef} idi, elinde ${this.oyun.sayilar[0]} kaldı.`,
        primaryLabel: 'Baştan dene',
        onPrimary: () => {
          this.hud.hideOverlay()
          this.oyun.bastanBasla()
          setChip('moves', 0)
          this.ciz()
        },
        secondaryLabel: 'Yeni bulmaca',
        onSecondary: () => this.yenidenBasla(),
      })
    }
  }

  private ciz(): void {
    this.katman.removeAll(true)

    this.katman.add(
      this.add
        .text(GAME_WIDTH / 2, HEDEF_Y, `Hedef: ${this.oyun.hedef}`, {
          fontFamily: FONT_FAMILY,
          fontSize: '34px',
          fontStyle: 'bold',
          color: COLORS.YAZI,
        })
        .setOrigin(0.5),
    )

    this.oyun.sayilar.forEach((sayi, i) => {
      const secili = this.oyun.seciliSayilar.includes(i)
      const x = this.sayiX(i, this.oyun.sayilar.length)
      this.katman.add(this.add.circle(x, SAYI_Y, SAYI_YARICAP, secili ? COLORS.SECILI : COLORS.SAYI))
      this.katman.add(
        this.add
          .text(x, SAYI_Y, String(sayi), {
            fontFamily: FONT_FAMILY,
            fontSize: '26px',
            fontStyle: 'bold',
            color: secili ? COLORS.KOYU_YAZI : COLORS.YAZI,
          })
          .setOrigin(0.5),
      )
    })

    ISLEMLER.forEach((islem, i) => {
      const secili = this.oyun.seciliIslem === islem
      const x = this.islemX(i)
      this.katman.add(this.add.circle(x, ISLEM_Y, ISLEM_YARICAP, secili ? COLORS.ISLEM_SECILI : COLORS.ISLEM))
      this.katman.add(
        this.add
          .text(x, ISLEM_Y, islem, {
            fontFamily: FONT_FAMILY,
            fontSize: '28px',
            fontStyle: 'bold',
            color: secili ? COLORS.KOYU_YAZI : COLORS.YAZI,
          })
          .setOrigin(0.5),
      )
    })

    this.katman.add(
      this.add
        .text(GAME_WIDTH / 2, ISLEM_Y + 80, 'İki sayı ve bir işlem seç', {
          fontFamily: FONT_FAMILY,
          fontSize: '15px',
          color: COLORS.YAZI,
        })
        .setOrigin(0.5)
        .setAlpha(0.6),
    )
  }
}
