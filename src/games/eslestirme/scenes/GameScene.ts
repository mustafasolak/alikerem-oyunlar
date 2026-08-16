import * as Phaser from 'phaser'

import { TemelSahne } from '../../../shared/TemelSahne.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { setChip } from '../../../shared/dom.ts'
import {
  CIFT_SAYISI,
  COLORS,
  FONT_FAMILY,
  GAME_HEIGHT,
  GAME_WIDTH,
  KART_ARALIK,
  KART_GENISLIK,
  KART_YUKSEKLIK,
  SAG_X,
  SOL_X,
  UST_BOSLUK,
  YAZI_BOYU,
  skorHesapla,
} from '../config/constants.ts'
import { Eslestirme } from '../systems/Eslestirme.ts'

export class GameScene extends TemelSahne {
  private oyun!: Eslestirme
  private katman!: Phaser.GameObjects.Container

  constructor() {
    super('eslestirme')
  }

  protected kur(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(14)
    this.katman = this.add.container(0, 0)
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.dokun(p))
  }

  protected yeniOyun(): void {
    this.oyun = new Eslestirme(CIFT_SAYISI)
    setChip('remaining', this.oyun.kalan)
    setChip('timer', '0:00')
    this.skorGoster(0)
    this.ciz()
  }

  private kartY(sira: number): number {
    return UST_BOSLUK + sira * (KART_YUKSEKLIK + KART_ARALIK) + KART_YUKSEKLIK / 2
  }

  private dokun(p: Phaser.Input.Pointer): void {
    if (this.bitti) return
    const sira = Math.floor((p.worldY - UST_BOSLUK) / (KART_YUKSEKLIK + KART_ARALIK))
    if (sira < 0 || sira >= CIFT_SAYISI) return
    const solTaraf = p.worldX < GAME_WIDTH / 2

    this.sayac.basla()
    if (solTaraf) {
      if (this.oyun.solSec(sira)) {
        sesler.tik()
        this.ciz()
      }
      return
    }

    const sonuc = this.oyun.sagSec(sira)
    if (sonuc === 'yok') return
    if (sonuc === 'dogru') {
      sesler.dogru()
      setChip('remaining', this.oyun.kalan)
    } else {
      sesler.yanlis()
      this.cameras.main.shake(140, 0.005)
    }
    this.ciz()

    if (this.oyun.bitti) {
      const skor = skorHesapla(this.oyun.hata, this.sayac.saniye)
      this.turuBitir({
        baslik: 'Hepsini eşleştirdin! 🎉',
        ozet: `${this.oyun.hata} hata · ${this.sayac.yazi} · Skor: ${skor}`,
        skor,
      })
    }
  }

  private ciz(): void {
    this.katman.removeAll(true)
    const yaz = (x: number, sira: number, secenek: { yazi: string; eslesti: boolean }, secili: boolean) => {
      const y = this.kartY(sira)
      const renk = secenek.eslesti ? COLORS.ESLESEN : secili ? COLORS.SECILI : COLORS.KART
      this.katman.add(this.add.rectangle(x, y, KART_GENISLIK, KART_YUKSEKLIK, renk).setRounded(10))
      this.katman.add(
        this.add
          .text(x, y, secenek.yazi, {
            fontFamily: FONT_FAMILY,
            fontSize: `${YAZI_BOYU}px`,
            fontStyle: 'bold',
            color: COLORS.YAZI,
            align: 'center',
            wordWrap: { width: KART_GENISLIK - 16 },
          })
          .setOrigin(0.5),
      )
    }

    this.oyun.sol.forEach((s, i) => yaz(SOL_X, i, s, this.oyun.seciliSol === i))
    this.oyun.sag.forEach((s, i) => yaz(SAG_X, i, s, false))
  }
}
