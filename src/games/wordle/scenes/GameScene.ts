import * as Phaser from 'phaser'

import { KeyPad } from '../../../shared/KeyPad.ts'
import { TemelSahne } from '../../../shared/TemelSahne.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { setChip } from '../../../shared/dom.ts'
import { TURKCE_ALFABE } from '../../../shared/kelimeler.ts'
import {
  ACILMA_SURESI,
  COLORS,
  FONT_FAMILY,
  GAME_WIDTH,
  HARF_FONT,
  HARF_SAYISI,
  KUTU,
  KUTU_ARALIK,
  KUTU_RADIUS,
  MAX_DENEME,
  SALLANMA_SURESI,
  UST_BOSLUK,
  skorHesapla,
} from '../config/constants.ts'
import { WordleGame, type HarfDurumu } from '../systems/WordleGame.ts'

const GIR = 'gir'
const SIL = 'sil'

const DURUM_RENGI: Record<HarfDurumu, number> = {
  dogru: COLORS.DOGRU,
  var: COLORS.VAR,
  yok: COLORS.YOK,
}

export class GameScene extends TemelSahne {
  private readonly oyun = new WordleGame()
  private keypad?: KeyPad
  private katman!: Phaser.GameObjects.Container

  constructor() {
    super('wordle')
  }

  protected kur(): void {
    this.katman = this.add.container(0, 0)
    this.kurKeypad()

    const keyboard = this.input.keyboard
    if (keyboard) {
      keyboard.on('keydown', (event: KeyboardEvent) => {
        if (this.yaziyor || event.metaKey || event.ctrlKey || event.altKey) return
        if (event.key === 'Enter') this.dene()
        else if (event.key === 'Backspace') this.bas(SIL)
        else {
          const harf = event.key.toLocaleUpperCase('tr')
          if (harf.length === 1 && TURKCE_ALFABE.includes(harf)) this.bas(harf)
        }
      })
    }
  }

  private kurKeypad(): void {
    const container = document.getElementById('keypad')
    if (!container) return
    this.keypad = new KeyPad({
      container,
      keys: [...TURKCE_ALFABE, { label: 'Sil', value: SIL, wide: true }, { label: 'Gir', value: GIR, wide: true }],
      columns: 10,
      onPress: (value) => this.bas(value),
    })
  }

  protected yeniOyun(): void {
    this.oyun.reset()
    this.keypad?.reset()
    this.keypad?.setEnabled(true)
    setChip('tries', this.oyun.kalanHak)
    this.skorGoster(0)
    this.ciz()
  }

  private bas(value: string): void {
    if (this.bitti || this.yaziyor) return
    if (value === GIR) {
      this.dene()
      return
    }
    const degisti = value === SIL ? this.oyun.harfSil() : this.oyun.harfEkle(value)
    if (degisti) {
      sesler.tik()
      this.ciz()
    }
  }

  private dene(): void {
    const deneme = this.oyun.dene()
    if (!deneme) {
      sesler.yanlis()
      this.sallat()
      return
    }

    this.sayac.basla()
    setChip('tries', this.oyun.kalanHak)
    this.ciz()
    this.klavyeyiBoyar()

    if (this.oyun.durum === 'kazandi') {
      const skor = skorHesapla(this.oyun.denemeler.length)
      this.keypad?.setEnabled(false)
      this.turuBitir({
        baslik: 'Bildin! 🎉',
        ozet: `${this.oyun.gizli} · ${this.oyun.denemeler.length}. denemede · Skor: ${skor}`,
        skor,
      })
    } else if (this.oyun.durum === 'kaybetti') {
      this.keypad?.setEnabled(false)
      this.turuBitir({ baslik: 'Hakkın bitti', ozet: `Kelime: ${this.oyun.gizli}`, skor: 0, kazandi: false })
    } else {
      sesler.tik()
    }
  }

  private klavyeyiBoyar(): void {
    for (const [harf, durum] of this.oyun.harfDurumlari) {
      this.keypad?.setState(harf, durum === 'dogru' ? 'correct' : durum === 'var' ? 'used' : 'wrong')
    }
  }

  private kutuX(sutun: number): number {
    const toplam = HARF_SAYISI * KUTU + (HARF_SAYISI - 1) * KUTU_ARALIK
    return (GAME_WIDTH - toplam) / 2 + sutun * (KUTU + KUTU_ARALIK) + KUTU / 2
  }

  private kutuY(satir: number): number {
    return UST_BOSLUK + satir * (KUTU + KUTU_ARALIK) + KUTU / 2
  }

  /** Eksik tahminde satırı sallayarak uyar. */
  private sallat(): void {
    this.tweens.add({
      targets: this.katman,
      x: { from: -8, to: 8 },
      duration: SALLANMA_SURESI / 6,
      yoyo: true,
      repeat: 2,
      onComplete: () => this.katman.setX(0),
    })
  }

  private ciz(): void {
    this.katman.removeAll(true)

    for (let satir = 0; satir < MAX_DENEME; satir++) {
      const deneme = this.oyun.denemeler[satir]
      const aktif = satir === this.oyun.denemeler.length
      const yazi = deneme ? deneme.kelime : aktif ? this.oyun.taslak : ''

      for (let sutun = 0; sutun < HARF_SAYISI; sutun++) {
        const x = this.kutuX(sutun)
        const y = this.kutuY(satir)
        const harf = yazi[sutun] ?? ''
        const durum = deneme?.durumlar[sutun]

        const kutu = this.add
          .rectangle(x, y, KUTU, KUTU, durum ? DURUM_RENGI[durum] : COLORS.BOS)
          .setRounded(KUTU_RADIUS)
        if (!durum) kutu.setStrokeStyle(2, harf ? COLORS.DOLU_KENAR : COLORS.BOS_KENAR)
        this.katman.add(kutu)

        if (harf) {
          this.katman.add(
            this.add
              .text(x, y, harf, {
                fontFamily: FONT_FAMILY,
                fontSize: `${HARF_FONT}px`,
                fontStyle: 'bold',
                color: COLORS.YAZI,
              })
              .setOrigin(0.5),
          )
        }

        if (durum && satir === this.oyun.denemeler.length - 1) {
          kutu.setScale(0.6)
          this.tweens.add({
            targets: kutu,
            scale: 1,
            duration: ACILMA_SURESI,
            delay: sutun * 60,
            ease: 'Back.easeOut',
          })
        }
      }
    }
  }
}
