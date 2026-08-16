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
  TAS_ARALIK,
  TAS_GENISLIK,
  TAS_YUKSEKLIK,
  UST_BOSLUK,
  VARSAYILAN_ZORLUK,
  ZORLUKLAR,
  skorHesapla,
  type Zorluk,
} from '../config/constants.ts'
import { SayiPiramidi } from '../systems/SayiPiramidi.ts'

const SIL = 'sil'

export class GameScene extends TemelSahne {
  private oyun!: SayiPiramidi
  private zorluk: Zorluk = VARSAYILAN_ZORLUK
  private katman!: Phaser.GameObjects.Container
  private keypad?: KeyPad
  private secili = -1

  constructor() {
    super('sayipiramidi')
  }

  protected kur(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(14)
    this.katman = this.add.container(0, 0)

    const container = document.getElementById('keypad')
    if (container) {
      this.keypad = new KeyPad({
        container,
        keys: [...Array.from({ length: 10 }, (_, i) => String(i)), { label: 'Sil', value: SIL, wide: true }],
        columns: 12,
        onPress: (v) => this.rakamBas(v),
      })
    }

    const keyboard = this.input.keyboard
    if (keyboard) {
      keyboard.on('keydown', (e: KeyboardEvent) => {
        if (this.yaziyor || e.metaKey || e.ctrlKey) return
        if (e.key >= '0' && e.key <= '9') this.rakamBas(e.key)
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
    const ayar = ZORLUKLAR[this.zorluk]
    this.oyun = new SayiPiramidi(ayar.kat, ayar.gizli, ayar.enBuyukTaban)
    this.secili = -1
    this.keypad?.setEnabled(true)
    setChip('remaining', this.oyun.kalan)
    setChip('timer', '0:00')
    this.skorGoster(0)
    this.ciz()
  }

  private tasX(kat: number, sira: number): number {
    const toplam = (kat + 1) * TAS_GENISLIK + kat * TAS_ARALIK
    return (GAME_WIDTH - toplam) / 2 + sira * (TAS_GENISLIK + TAS_ARALIK) + TAS_GENISLIK / 2
  }

  private tasY(kat: number): number {
    return UST_BOSLUK + kat * (TAS_YUKSEKLIK + TAS_ARALIK) + TAS_YUKSEKLIK / 2
  }

  private dokun(p: Phaser.Input.Pointer): void {
    if (this.bitti) return
    const kat = Math.floor((p.worldY - UST_BOSLUK) / (TAS_YUKSEKLIK + TAS_ARALIK))
    if (kat < 0 || kat >= this.oyun.kat) return
    for (let sira = 0; sira <= kat; sira++) {
      const x = this.tasX(kat, sira)
      if (Math.abs(p.worldX - x) > TAS_GENISLIK / 2) continue
      const index = this.oyun.index(kat, sira)
      if (!this.oyun.taslar[index].gizli) return
      this.secili = index
      this.sayac.basla()
      sesler.tik()
      this.ciz()
      return
    }
  }

  private rakamBas(deger: string): void {
    if (this.bitti || this.secili < 0 || this.yaziyor) return
    const tas = this.oyun.taslar[this.secili]

    if (deger === SIL) {
      this.oyun.yaz(this.secili, null)
      sesler.tik()
      this.ciz()
      return
    }

    // Çok basamaklı sayılar için: mevcut değere rakam ekle
    const mevcut = tas.girilen ?? 0
    const yeni = mevcut * 10 + Number(deger)
    const sonuc = this.oyun.yaz(this.secili, yeni > 999 ? Number(deger) : yeni)

    if (sonuc === 'dogru') sesler.dogru()
    else if (sonuc === 'yanlis') sesler.tik()
    setChip('remaining', this.oyun.kalan)
    this.ciz()

    if (this.oyun.bitti) {
      const skor = skorHesapla(this.zorluk, this.oyun.hata, this.sayac.saniye)
      this.keypad?.setEnabled(false)
      this.turuBitir({
        baslik: 'Piramidi tamamladın! 🎉',
        ozet: `${ZORLUKLAR[this.zorluk].ad} · ${this.oyun.hata} hata · ${this.sayac.yazi} · Skor: ${skor}`,
        skor,
      })
    }
  }

  private ciz(): void {
    this.katman.removeAll(true)
    for (let kat = 0; kat < this.oyun.kat; kat++) {
      for (let sira = 0; sira <= kat; sira++) {
        const index = this.oyun.index(kat, sira)
        const tas = this.oyun.taslar[index]
        const x = this.tasX(kat, sira)
        const y = this.tasY(kat)

        const dogruDolu = tas.gizli && tas.girilen === tas.deger
        const renk = !tas.gizli
          ? COLORS.VERILEN
          : this.secili === index
            ? COLORS.SECILI
            : dogruDolu
              ? COLORS.DOGRU
              : COLORS.BOS

        this.katman.add(this.add.rectangle(x, y, TAS_GENISLIK, TAS_YUKSEKLIK, renk).setRounded(8))
        const yazi = tas.gizli ? (tas.girilen === null ? '' : String(tas.girilen)) : String(tas.deger)
        this.katman.add(
          this.add
            .text(x, y, yazi, {
              fontFamily: FONT_FAMILY,
              fontSize: '22px',
              fontStyle: 'bold',
              color: this.secili === index ? COLORS.SECILI_YAZI : COLORS.YAZI,
            })
            .setOrigin(0.5),
        )
      }
    }
  }
}
