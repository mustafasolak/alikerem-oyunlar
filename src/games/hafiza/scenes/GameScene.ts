import * as Phaser from 'phaser'

import { KareIzgara, izgaraYerlesimi } from '../../../shared/KareIzgara.ts'
import { TemelSahne } from '../../../shared/TemelSahne.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { butonGrubu, setChip } from '../../../shared/dom.ts'
import {
  BOARD_PADDING,
  CEVIRME_SURESI,
  COLORS,
  GAME_HEIGHT,
  GAME_WIDTH,
  KAPANMA_GECIKMESI,
  VARSAYILAN_ZORLUK,
  ZORLUKLAR,
  skorHesapla,
  type Zorluk,
} from '../config/constants.ts'
import { HafizaOyunu } from '../systems/HafizaOyunu.ts'

export class GameScene extends TemelSahne {
  private oyun!: HafizaOyunu
  private izgara?: KareIzgara
  private zorluk: Zorluk = VARSAYILAN_ZORLUK

  constructor() {
    super('hafiza')
  }

  protected kur(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(14)
    butonGrubu('toolbar', 'level', (value) => {
      this.zorluk = value as Zorluk
      this.yenidenBasla()
    })
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.dokun(p))
  }

  protected yeniOyun(): void {
    const ayar = ZORLUKLAR[this.zorluk]
    this.oyun = new HafizaOyunu(ayar.sutun, ayar.satir)

    this.izgara?.katman.destroy()
    const yerlesim = izgaraYerlesimi(GAME_WIDTH, GAME_HEIGHT, ayar.sutun, ayar.satir, BOARD_PADDING)
    this.izgara = new KareIzgara(this, {
      sutun: ayar.sutun,
      satir: ayar.satir,
      hucreBoyu: yerlesim.hucreBoyu,
      ofsetX: yerlesim.ofsetX,
      ofsetY: yerlesim.ofsetY,
      bosluk: 8,
      radius: 10,
      zeminRenk: COLORS.ARKA,
      yaziBoyu: Math.round(yerlesim.hucreBoyu * 0.55),
    })

    setChip('pairs', `0/${this.oyun.toplamCift}`)
    setChip('timer', '0:00')
    this.skorGoster(0)
    this.ciz()
  }

  private dokun(pointer: Phaser.Input.Pointer): void {
    if (this.bitti || !this.izgara) return
    const hucre = this.izgara.hucreBul(pointer)
    if (!hucre) return

    const index = this.izgara.index(hucre.satir, hucre.sutun)
    if (index >= this.oyun.toplam) return

    const sonuc = this.oyun.cevir(index)
    if (sonuc.tur === 'yok') return

    this.sayac.basla()
    sesler.tik()
    this.ciz()

    if (sonuc.tur === 'eslesti') {
      sesler.dogru()
      setChip('pairs', `${this.oyun.eslesenCift}/${this.oyun.toplamCift}`)
      for (const kart of sonuc.kartlar) {
        const view = this.izgara.gorunumIndex(kart)
        this.tweens.add({ targets: view.zemin, scale: 1.12, duration: CEVIRME_SURESI, yoyo: true })
      }
      if (this.oyun.bitti) {
        const skor = skorHesapla(this.zorluk, this.oyun.hamle, this.sayac.saniye)
        this.turuBitir({
          baslik: 'Hepsini buldun! 🎉',
          ozet: `${ZORLUKLAR[this.zorluk].ad} · ${this.oyun.hamle} hamle · ${this.sayac.yazi} · Skor: ${skor}`,
          skor,
        })
      }
      return
    }

    if (sonuc.tur === 'tutmadi') {
      this.time.delayedCall(KAPANMA_GECIKMESI, () => {
        this.oyun.kapat()
        this.ciz()
      })
    }
  }

  private ciz(): void {
    this.izgara?.uygula((view, _satir, _sutun, index) => {
      const kart = this.oyun.kartlar[index]
      if (!kart) {
        view.zemin.setVisible(false)
        view.yazi.setText('')
        return
      }
      view.zemin.setVisible(true)
      const gorunur = kart.acik || kart.eslesti
      view.zemin.setFillStyle(kart.eslesti ? COLORS.ESLESEN : gorunur ? COLORS.ON : COLORS.ARKA)
      view.yazi.setText(gorunur ? kart.simge : '')
    })
  }
}
