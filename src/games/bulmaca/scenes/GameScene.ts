import * as Phaser from 'phaser'

import { GameHud } from '../../../shared/GameHud.ts'
import { KeyPad } from '../../../shared/KeyPad.ts'
import { Sayac } from '../../../shared/Sayac.ts'
import { ScoreRecorder } from '../../../shared/ScoreRecorder.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { element, setChip } from '../../../shared/dom.ts'
import { TURKCE_ALFABE } from '../../../shared/kelimeler.ts'
import {
  BOARD_PADDING,
  BOARD_RADIUS,
  COLORS,
  FONT_FAMILY,
  GAME_HEIGHT,
  GAME_WIDTH,
  HARF_ORAN,
  NUMARA_ORAN,
  skorHesapla,
} from '../config/constants.ts'
import { Crossword, type Yerlesim, type Yon } from '../systems/Crossword.ts'

interface HucreGorunumu {
  zemin: Phaser.GameObjects.Rectangle
  harf: Phaser.GameObjects.Text
  numara: Phaser.GameObjects.Text
}

const SIL = 'sil'

export class GameScene extends Phaser.Scene {
  private readonly oyun = new Crossword()
  private readonly sayac = new Sayac()

  private hud!: GameHud
  private recorder!: ScoreRecorder
  private keypad?: KeyPad
  private katman!: Phaser.GameObjects.Container
  private gorunumler = new Map<string, HucreGorunumu>()

  private hucreBoyu = 0
  private ofsetX = 0
  private ofsetY = 0
  private secili: { satir: number; sutun: number } | null = null
  private yon: Yon = 'yatay'
  private bitti = false
  private yaziyor = false

  constructor() {
    super('Bulmaca')
  }

  create(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(BOARD_RADIUS)
    this.katman = this.add.container(0, 0)

    this.hud = new GameHud({ onRestart: () => this.startNewGame() })
    this.hud.setScore(0)
    this.recorder = new ScoreRecorder('bulmaca', this.hud, (typing) => this.setTyping(typing))

    this.kurKeypad()
    this.bindKeyboard()
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.hucreSec(p))
    this.time.addEvent({ delay: 250, loop: true, callback: () => this.tazeleSure() })

    this.yeniBulmaca()
  }

  // --- Kurulum ---

  private kurKeypad(): void {
    const container = document.getElementById('keypad')
    if (!container) return
    this.keypad = new KeyPad({
      container,
      keys: [...TURKCE_ALFABE, { label: 'Sil', value: SIL, wide: true }],
      columns: 8,
      onPress: (value) => (value === SIL ? this.harfGir(null) : this.harfGir(value)),
    })
  }

  private bindKeyboard(): void {
    const keyboard = this.input.keyboard
    if (!keyboard) return
    keyboard.on('keydown', (event: KeyboardEvent) => {
      if (this.yaziyor || event.metaKey || event.ctrlKey || event.altKey) return
      if (event.key === 'Backspace' || event.key === 'Delete') {
        this.harfGir(null)
        return
      }
      if (event.key === ' ') {
        this.yonuDegistir()
        return
      }
      const harf = event.key.toLocaleUpperCase('tr')
      if (harf.length === 1 && TURKCE_ALFABE.includes(harf)) this.harfGir(harf)
    })
    keyboard.addCapture(['SPACE'])
  }

  private setTyping(typing: boolean): void {
    this.yaziyor = typing
    const keyboard = this.input.keyboard
    if (keyboard) {
      keyboard.enabled = !typing
      if (typing) keyboard.removeCapture(['SPACE'])
      else keyboard.addCapture(['SPACE'])
    }
    this.keypad?.setEnabled(!typing)
  }

  /** Kırpılmış ızgaraya göre hücre boyutunu ve tuvaldeki yerini hesaplar. */
  private izgarayiKur(): void {
    this.katman.removeAll(true)
    this.gorunumler.clear()

    const enBuyuk = Math.max(this.oyun.satirSayisi, this.oyun.sutunSayisi)
    this.hucreBoyu = Math.floor((GAME_WIDTH - BOARD_PADDING * 2) / enBuyuk)
    this.ofsetX = (GAME_WIDTH - this.oyun.sutunSayisi * this.hucreBoyu) / 2
    this.ofsetY = (GAME_HEIGHT - this.oyun.satirSayisi * this.hucreBoyu) / 2

    const harfBoyu = Math.round(this.hucreBoyu * HARF_ORAN)
    const numaraBoyu = Math.max(9, Math.round(this.hucreBoyu * NUMARA_ORAN))
    const baslangicNumaralari = new Map<string, number>()
    for (const y of this.oyun.yerlesimler) {
      baslangicNumaralari.set(`${y.satir},${y.sutun}`, y.numara)
    }

    for (let satir = 0; satir < this.oyun.satirSayisi; satir++) {
      for (let sutun = 0; sutun < this.oyun.sutunSayisi; sutun++) {
        if (!this.oyun.hucreDolu(satir, sutun)) continue
        const x = this.x(sutun)
        const y = this.y(satir)

        const zemin = this.add.rectangle(x, y, this.hucreBoyu - 2, this.hucreBoyu - 2, COLORS.HUCRE).setRounded(4)
        const harf = this.add
          .text(x, y + 2, '', {
            fontFamily: FONT_FAMILY,
            fontSize: `${harfBoyu}px`,
            fontStyle: 'bold',
            color: COLORS.HARF,
          })
          .setOrigin(0.5)
        const numara = this.add
          .text(x - this.hucreBoyu / 2 + 3, y - this.hucreBoyu / 2 + 2, String(baslangicNumaralari.get(`${satir},${sutun}`) ?? ''), {
            fontFamily: FONT_FAMILY,
            fontSize: `${numaraBoyu}px`,
            color: COLORS.NUMARA,
          })
          .setOrigin(0, 0)

        this.katman.add([zemin, harf, numara])
        this.gorunumler.set(`${satir},${sutun}`, { zemin, harf, numara })
      }
    }
  }

  // --- Girdi ---

  private hucreSec(pointer: Phaser.Input.Pointer): void {
    if (this.bitti) return
    const sutun = Math.floor((pointer.worldX - this.ofsetX) / this.hucreBoyu)
    const satir = Math.floor((pointer.worldY - this.ofsetY) / this.hucreBoyu)
    if (!this.oyun.hucreDolu(satir, sutun)) return

    // Aynı hücreye tekrar dokunmak yönü değiştirir.
    if (this.secili && this.secili.satir === satir && this.secili.sutun === sutun) {
      this.yonuDegistir()
      return
    }

    this.secili = { satir, sutun }
    this.sayac.basla()
    const kelimeler = this.oyun.hucredekiKelimeler(satir, sutun)
    if (!kelimeler.some((k) => k.yon === this.yon) && kelimeler.length > 0) {
      this.yon = kelimeler[0].yon
    }
    this.render()
  }

  private yonuDegistir(): void {
    if (!this.secili) return
    const kelimeler = this.oyun.hucredekiKelimeler(this.secili.satir, this.secili.sutun)
    const diger: Yon = this.yon === 'yatay' ? 'dikey' : 'yatay'
    if (kelimeler.some((k) => k.yon === diger)) this.yon = diger
    this.render()
  }

  private harfGir(harf: string | null): void {
    if (this.bitti || !this.secili || this.yaziyor) return
    this.sayac.basla()
    const oncekiCozulen = this.oyun.cozulenSayisi
    this.oyun.harfYaz(this.secili.satir, this.secili.sutun, harf)
    if (harf) this.ilerle(1)
    else this.ilerle(-1)

    if (this.oyun.cozulenSayisi > oncekiCozulen) sesler.dogru()
    else if (harf) sesler.tik()

    this.render()
    this.tazeleSkor()
    if (this.oyun.tamamlandi) this.tamamlandi()
  }

  /** Aktif kelime boyunca imleci kaydırır. */
  private ilerle(adim: number): void {
    if (!this.secili) return
    const aktif = this.aktifKelime()
    if (!aktif) return
    const hucreler = this.oyun.kelimeHucreleri(aktif)
    const su = hucreler.findIndex((h) => h.satir === this.secili!.satir && h.sutun === this.secili!.sutun)
    const hedef = hucreler[su + adim]
    if (hedef) this.secili = hedef
  }

  private aktifKelime(): Yerlesim | null {
    if (!this.secili) return null
    const kelimeler = this.oyun.hucredekiKelimeler(this.secili.satir, this.secili.sutun)
    return kelimeler.find((k) => k.yon === this.yon) ?? kelimeler[0] ?? null
  }

  // --- Oyun akışı ---

  private yeniBulmaca(): void {
    this.oyun.reset()
    this.sayac.sifirla()
    this.secili = null
    this.yon = 'yatay'
    this.bitti = false
    this.hud.setScore(0)
    this.keypad?.setEnabled(true)
    this.izgarayiKur()
    this.ipuclariniYaz()
    setChip('remaining', this.oyun.kalan)
    setChip('timer', '0:00')
    this.render()
  }

  private tamamlandi(): void {
    sesler.zafer()
    this.bitti = true
    this.sayac.durdur()
    this.keypad?.setEnabled(false)
    const score = skorHesapla(this.oyun.cozulenSayisi, this.sayac.saniye, true)
    this.hud.setScore(score)
    const ozet = `${this.oyun.yerlesimler.length} kelime · ${this.sayac.yazi} · Skor: ${score}`

    this.time.delayedCall(360, () => {
      this.recorder.finish(score, {
        title: 'Bulmacayı çözdün! 🎉',
        text: `${ozet} — skor tablosuna girdin!`,
        onDone: () =>
          this.hud.showOverlay({
            title: 'Bulmacayı çözdün! 🎉',
            text: ozet,
            primaryLabel: 'Yeni bulmaca',
            onPrimary: () => this.startNewGame(),
          }),
      })
    })
  }

  private startNewGame(): void {
    this.hud.hideOverlay()
    this.tweens.killAll()
    this.yeniBulmaca()
  }

  // --- Görünüm ---

  private render(): void {
    const aktif = this.aktifKelime()
    const aktifHucreler = new Set(
      aktif ? this.oyun.kelimeHucreleri(aktif).map((h) => `${h.satir},${h.sutun}`) : [],
    )

    for (const [anahtar, view] of this.gorunumler) {
      const [satir, sutun] = anahtar.split(',').map(Number)
      const secili = this.secili?.satir === satir && this.secili?.sutun === sutun

      if (secili) view.zemin.setFillStyle(COLORS.HUCRE_SECILI)
      else if (aktifHucreler.has(anahtar)) view.zemin.setFillStyle(COLORS.HUCRE_AKTIF)
      else view.zemin.setFillStyle(COLORS.HUCRE)

      view.harf.setText(this.oyun.girilen[satir][sutun] ?? '')
      view.harf.setColor(COLORS.HARF_DOGRU)
    }

    this.ipuclariniIsaretle(aktif)
    setChip('remaining', this.oyun.kalan)
  }

  private ipuclariniYaz(): void {
    const yatay = element<HTMLUListElement>('clues-across')
    const dikey = element<HTMLUListElement>('clues-down')
    yatay.replaceChildren()
    dikey.replaceChildren()

    for (const yerlesim of this.oyun.yerlesimler) {
      const item = document.createElement('li')
      item.dataset.no = String(yerlesim.numara)
      item.dataset.yon = yerlesim.yon

      const no = document.createElement('span')
      no.className = 'no'
      no.textContent = String(yerlesim.numara)
      const metin = document.createElement('span')
      // Kullanıcı verisi değil ama yine de metin olarak yazıyoruz.
      metin.textContent = `${yerlesim.ipucu} (${yerlesim.kelime.length})`

      item.append(no, metin)
      item.addEventListener('click', () => {
        this.secili = { satir: yerlesim.satir, sutun: yerlesim.sutun }
        this.yon = yerlesim.yon
        this.sayac.basla()
        this.render()
      })
      ;(yerlesim.yon === 'yatay' ? yatay : dikey).append(item)
    }
  }

  private ipuclariniIsaretle(aktif: Yerlesim | null): void {
    for (const yerlesim of this.oyun.yerlesimler) {
      const liste = yerlesim.yon === 'yatay' ? 'clues-across' : 'clues-down'
      const item = document
        .getElementById(liste)
        ?.querySelector<HTMLLIElement>(`li[data-no="${yerlesim.numara}"][data-yon="${yerlesim.yon}"]`)
      if (!item) continue
      item.classList.toggle('is-active', aktif?.numara === yerlesim.numara && aktif?.yon === yerlesim.yon)
      item.classList.toggle('is-solved', this.oyun.kelimeCozuldu(yerlesim))
    }
  }

  private tazeleSkor(): void {
    this.hud.setScore(skorHesapla(this.oyun.cozulenSayisi, this.sayac.saniye, false))
  }

  private tazeleSure(): void {
    if (!this.bitti) setChip('timer', this.sayac.yazi)
  }

  private x(sutun: number): number {
    return this.ofsetX + sutun * this.hucreBoyu + this.hucreBoyu / 2
  }

  private y(satir: number): number {
    return this.ofsetY + satir * this.hucreBoyu + this.hucreBoyu / 2
  }
}
