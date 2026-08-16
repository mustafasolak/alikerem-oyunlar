import * as Phaser from 'phaser'

import { KeyPad } from '../../../shared/KeyPad.ts'
import { TemelSahne } from '../../../shared/TemelSahne.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { butonGrubu, setChip } from '../../../shared/dom.ts'
import {
  COLORS,
  FONT_FAMILY,
  GAME_HEIGHT,
  GAME_WIDTH,
  VARSAYILAN_ZORLUK,
  ZORLUKLAR,
  skorHesapla,
  type Zorluk,
} from '../config/constants.ts'
import { Kakuro } from '../systems/Kakuro.ts'

const SIL = 'sil'

export class GameScene extends TemelSahne {
  private oyun!: Kakuro
  private zorluk: Zorluk = VARSAYILAN_ZORLUK
  private katman!: Phaser.GameObjects.Container
  private keypad?: KeyPad
  private hucreBoyu = 0
  private ofset = 0
  private secili = -1

  constructor() {
    super('kakuro')
  }

  protected kur(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(14)
    this.katman = this.add.container(0, 0)

    const container = document.getElementById('keypad')
    if (container) {
      this.keypad = new KeyPad({
        container,
        keys: [...Array.from({ length: 9 }, (_, i) => String(i + 1)), { label: 'Sil', value: SIL, wide: true }],
        columns: 11,
        onPress: (v) => this.rakamBas(v),
      })
    }

    const keyboard = this.input.keyboard
    if (keyboard) {
      keyboard.on('keydown', (e: KeyboardEvent) => {
        if (this.yaziyor || e.metaKey || e.ctrlKey) return
        if (e.key >= '1' && e.key <= '9') this.rakamBas(e.key)
        else if (e.key === 'Backspace' || e.key === 'Delete') this.rakamBas(SIL)
      })
    }

    butonGrubu('toolbar', 'level', (v) => {
      this.zorluk = v as Zorluk
      this.yenidenBasla()
    })
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.dokun(p))
  }

  protected yeniOyun(): void {
    const a = ZORLUKLAR[this.zorluk]
    this.oyun = new Kakuro(a.boyut)
    this.hucreBoyu = Math.floor((GAME_WIDTH - 30) / a.boyut)
    this.ofset = (GAME_WIDTH - a.boyut * this.hucreBoyu) / 2
    this.secili = -1
    this.keypad?.setEnabled(true)
    setChip('remaining', this.oyun.kalan)
    setChip('timer', '0:00')
    this.skorGoster(0)
    this.ciz()
  }

  private x(t: number): number {
    return this.ofset + t * this.hucreBoyu + this.hucreBoyu / 2
  }

  private y(s: number): number {
    return this.ofset + s * this.hucreBoyu + this.hucreBoyu / 2
  }

  private dokun(p: Phaser.Input.Pointer): void {
    if (this.bitti) return
    const t = Math.floor((p.worldX - this.ofset) / this.hucreBoyu)
    const s = Math.floor((p.worldY - this.ofset) / this.hucreBoyu)
    const hucre = this.oyun.hucre(s, t)
    if (!hucre || hucre.tur !== 'dolu') return
    this.secili = this.oyun.index(s, t)
    this.sayac.basla()
    sesler.tik()
    this.ciz()
  }

  private rakamBas(deger: string): void {
    if (this.bitti || this.secili < 0 || this.yaziyor) return
    const sonuc = this.oyun.yaz(this.secili, deger === SIL ? null : Number(deger))
    if (sonuc === 'dogru') sesler.dogru()
    else if (sonuc === 'yanlis') {
      sesler.yanlis()
      this.cameras.main.shake(110, 0.004)
    } else sesler.tik()

    setChip('remaining', this.oyun.kalan)
    this.ciz()

    if (this.oyun.bitti) {
      const skor = skorHesapla(this.zorluk, this.oyun.hata, this.sayac.saniye)
      this.keypad?.setEnabled(false)
      this.turuBitir({
        baslik: 'Kakuro’yu çözdün! 🎉',
        ozet: `${ZORLUKLAR[this.zorluk].ad} · ${this.oyun.hata} hata · ${this.sayac.yazi} · Skor: ${skor}`,
        skor,
      })
    }
  }

  private ciz(): void {
    this.katman.removeAll(true)
    const kucukFont = Math.max(9, Math.round(this.hucreBoyu * 0.26))
    const buyukFont = Math.round(this.hucreBoyu * 0.5)

    for (let s = 0; s < this.oyun.boyut; s++) {
      for (let t = 0; t < this.oyun.boyut; t++) {
        const index = this.oyun.index(s, t)
        const hucre = this.oyun.hucreler[index]
        const cx = this.x(t)
        const cy = this.y(s)

        if (hucre.tur === 'blok') {
          this.katman.add(
            this.add.rectangle(cx, cy, this.hucreBoyu - 2, this.hucreBoyu - 2, COLORS.IPUCU).setRounded(4),
          )
          if (hucre.sagToplam > 0) {
            this.katman.add(
              this.add
                .text(cx + this.hucreBoyu * 0.28, cy + this.hucreBoyu * 0.22, String(hucre.sagToplam), {
                  fontFamily: FONT_FAMILY,
                  fontSize: `${kucukFont}px`,
                  fontStyle: 'bold',
                  color: COLORS.IPUCU_YAZI,
                })
                .setOrigin(1, 0.5),
            )
          }
          if (hucre.altToplam > 0) {
            this.katman.add(
              this.add
                .text(cx - this.hucreBoyu * 0.22, cy - this.hucreBoyu * 0.24, String(hucre.altToplam), {
                  fontFamily: FONT_FAMILY,
                  fontSize: `${kucukFont}px`,
                  fontStyle: 'bold',
                  color: COLORS.IPUCU_YAZI,
                })
                .setOrigin(0, 0.5),
            )
          }
          continue
        }

        const dogru = hucre.girilen === hucre.deger
        const renk = this.secili === index ? COLORS.SECILI : dogru ? COLORS.DOGRU : COLORS.BOS
        this.katman.add(this.add.rectangle(cx, cy, this.hucreBoyu - 2, this.hucreBoyu - 2, renk).setRounded(4))
        this.katman.add(
          this.add
            .text(cx, cy, hucre.girilen === null ? '' : String(hucre.girilen), {
              fontFamily: FONT_FAMILY,
              fontSize: `${buyukFont}px`,
              fontStyle: 'bold',
              color: this.secili === index ? COLORS.KOYU_YAZI : COLORS.YAZI,
            })
            .setOrigin(0.5),
        )
      }
    }
  }
}
