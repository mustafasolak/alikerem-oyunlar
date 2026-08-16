import * as Phaser from 'phaser'

import { KeyPad } from '../../../shared/KeyPad.ts'
import { TemelSahne } from '../../../shared/TemelSahne.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { setChip } from '../../../shared/dom.ts'
import { TURKCE_ALFABE } from '../../../shared/kelimeler.ts'
import {
  COLORS,
  FONT_FAMILY,
  GAME_HEIGHT,
  GAME_WIDTH,
  KUTU,
  KUTU_ARALIK,
  SATIR_ARALIK,
  SATIR_Y,
  skorHesapla,
} from '../config/constants.ts'
import { SifreOyunu } from '../systems/SifreOyunu.ts'

const SIL = 'sil'
const KELIME_SAYISI = 4

export class GameScene extends TemelSahne {
  private oyun!: SifreOyunu
  private katman!: Phaser.GameObjects.Container
  private keypad?: KeyPad
  private seciliNumara = -1

  constructor() {
    super('sifre')
  }

  protected kur(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(14)
    this.katman = this.add.container(0, 0)

    const container = document.getElementById('keypad')
    if (container) {
      this.keypad = new KeyPad({
        container,
        keys: [...TURKCE_ALFABE, { label: 'Sil', value: SIL, wide: true }],
        columns: 10,
        onPress: (v) => this.harfBas(v),
      })
    }

    const keyboard = this.input.keyboard
    if (keyboard) {
      keyboard.on('keydown', (e: KeyboardEvent) => {
        if (this.yaziyor || e.metaKey || e.ctrlKey) return
        if (e.key === 'Backspace' || e.key === 'Delete') this.harfBas(SIL)
        else {
          const harf = e.key.toLocaleUpperCase('tr')
          if (harf.length === 1 && TURKCE_ALFABE.includes(harf)) this.harfBas(harf)
        }
      })
    }

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.dokun(p))
  }

  protected yeniOyun(): void {
    this.oyun = new SifreOyunu(KELIME_SAYISI)
    this.seciliNumara = -1
    this.keypad?.setEnabled(true)
    setChip('remaining', this.oyun.kalan)
    setChip('mistakes', 0)
    this.skorGoster(0)
    this.ciz()
  }

  private kutuX(sira: number, uzunluk: number): number {
    const toplam = uzunluk * KUTU + (uzunluk - 1) * KUTU_ARALIK
    return (GAME_WIDTH - toplam) / 2 + sira * (KUTU + KUTU_ARALIK) + KUTU / 2
  }

  private satirY(i: number): number {
    return SATIR_Y + i * SATIR_ARALIK
  }

  private dokun(p: Phaser.Input.Pointer): void {
    if (this.bitti) return
    for (let i = 0; i < this.oyun.hucreler.length; i++) {
      if (Math.abs(p.worldY - this.satirY(i)) > KUTU / 2 + 6) continue
      const satir = this.oyun.hucreler[i]
      for (let j = 0; j < satir.length; j++) {
        if (Math.abs(p.worldX - this.kutuX(j, satir.length)) > KUTU / 2) continue
        if (satir[j].verilen) return
        this.seciliNumara = satir[j].numara
        this.sayac.basla()
        sesler.tik()
        this.ciz()
        return
      }
    }
  }

  private harfBas(harf: string): void {
    if (this.bitti || this.seciliNumara < 0 || this.yaziyor) return
    const sonuc = this.oyun.yaz(this.seciliNumara, harf === SIL ? null : harf)
    if (sonuc === 'dogru') sesler.dogru()
    else if (sonuc === 'yanlis') {
      sesler.yanlis()
      setChip('mistakes', this.oyun.hata)
    } else sesler.tik()

    setChip('remaining', this.oyun.kalan)
    this.ciz()

    if (this.oyun.bitti) {
      const skor = skorHesapla(this.oyun.hata)
      this.keypad?.setEnabled(false)
      this.turuBitir({
        baslik: 'Şifreyi çözdün! 🎉',
        ozet: `${this.oyun.kelimeler.join(' · ')} · ${this.oyun.hata} hata · Skor: ${skor}`,
        skor,
      })
    }
  }

  private ciz(): void {
    this.katman.removeAll(true)
    this.oyun.hucreler.forEach((satir, i) => {
      satir.forEach((hucre, j) => {
        const x = this.kutuX(j, satir.length)
        const y = this.satirY(i)
        const dogru = hucre.girilen === hucre.harf
        const renk = hucre.verilen
          ? COLORS.KUTU_VERILEN
          : this.seciliNumara === hucre.numara
            ? COLORS.KUTU_SECILI
            : dogru
              ? COLORS.KUTU_DOGRU
              : COLORS.KUTU

        this.katman.add(this.add.rectangle(x, y, KUTU, KUTU, renk).setRounded(7))
        this.katman.add(
          this.add
            .text(x, y - 4, hucre.girilen ?? '', {
              fontFamily: FONT_FAMILY,
              fontSize: '22px',
              fontStyle: 'bold',
              color: this.seciliNumara === hucre.numara && !hucre.verilen ? COLORS.KOYU_YAZI : COLORS.YAZI,
            })
            .setOrigin(0.5),
        )
        this.katman.add(
          this.add
            .text(x, y + KUTU / 2 - 8, String(hucre.numara), {
              fontFamily: FONT_FAMILY,
              fontSize: '11px',
              color: COLORS.NUMARA,
            })
            .setOrigin(0.5),
        )
      })
    })
  }
}
