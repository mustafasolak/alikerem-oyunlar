import * as Phaser from 'phaser'

import { GameHud } from '../../../shared/GameHud.ts'
import { Sayac } from '../../../shared/Sayac.ts'
import { ScoreRecorder } from '../../../shared/ScoreRecorder.ts'
import { butonGrubu, setChip } from '../../../shared/dom.ts'
import {
  ACILMA_SURESI,
  BOARD_PADDING,
  BOARD_RADIUS,
  CELL_GAP,
  CELL_RADIUS,
  COLORS,
  FONT_FAMILY,
  GAME_HEIGHT,
  GAME_WIDTH,
  PATLAMA_SARSINTI,
  PATLAMA_SARSINTI_MS,
  SAYI_RENKLERI,
  UZUN_BASMA_MS,
  VARSAYILAN_ZORLUK,
  ZORLUKLAR,
  skorHesapla,
  type Zorluk,
} from '../config/constants.ts'
import { Minesweeper } from '../systems/Minesweeper.ts'

interface HucreGorunumu {
  zemin: Phaser.GameObjects.Rectangle
  yazi: Phaser.GameObjects.Text
}

export class GameScene extends Phaser.Scene {
  private readonly sayac = new Sayac()

  private oyun!: Minesweeper
  private zorluk: Zorluk = VARSAYILAN_ZORLUK
  private hud!: GameHud
  private recorder!: ScoreRecorder
  private katman!: Phaser.GameObjects.Container
  private gorunumler: HucreGorunumu[] = []
  private hucreBoyu = 0

  /** Uzun basma bayrak koyduysa bırakınca açma yapmayalım. */
  private uzunBasmaTimer?: Phaser.Time.TimerEvent
  private uzunBasmaYapildi = false
  private basilanIndex = -1

  constructor() {
    super('Mayin')
  }

  create(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(BOARD_RADIUS)
    this.katman = this.add.container(0, 0)

    this.hud = new GameHud({ onRestart: () => this.startNewGame() })
    this.hud.setScore(0)
    this.recorder = new ScoreRecorder('mayin', this.hud, (typing) => this.setTyping(typing))

    butonGrubu('toolbar', 'level', (value) => {
      this.zorluk = value as Zorluk
      this.startNewGame()
    })

    this.input.mouse?.disableContextMenu()
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.basildi(pointer))
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => this.birakildi(pointer))

    this.time.addEvent({ delay: 250, loop: true, callback: () => this.tazeleSure() })
    this.kur()
  }

  // --- Kurulum ---

  private kur(): void {
    const ayar = ZORLUKLAR[this.zorluk]
    this.oyun = new Minesweeper(ayar.sutun, ayar.satir, ayar.mayin)
    this.hucreBoyu = (GAME_WIDTH - BOARD_PADDING * 2) / ayar.sutun

    this.katman.removeAll(true)
    this.gorunumler = []

    const boyut = this.hucreBoyu - CELL_GAP
    const yaziBoyu = Math.round(boyut * 0.58)

    for (let index = 0; index < this.oyun.toplam; index++) {
      const { satir, sutun } = this.oyun.konum(index)
      const x = this.x(sutun)
      const y = this.y(satir)

      const zemin = this.add.rectangle(x, y, boyut, boyut, COLORS.KAPALI).setRounded(CELL_RADIUS)
      const yazi = this.add
        .text(x, y, '', {
          fontFamily: FONT_FAMILY,
          fontSize: `${yaziBoyu}px`,
          fontStyle: 'bold',
          color: '#ffffff',
        })
        .setOrigin(0.5)

      this.katman.add([zemin, yazi])
      this.gorunumler.push({ zemin, yazi })
    }

    this.sayac.sifirla()
    this.hud.setScore(0)
    setChip('flags', this.oyun.kalanMayin)
    setChip('timer', '0:00')
    this.render()
  }

  private setTyping(typing: boolean): void {
    const keyboard = this.input.keyboard
    if (keyboard) keyboard.enabled = !typing
  }

  // --- Girdi ---

  private indexBul(pointer: Phaser.Input.Pointer): number {
    const sutun = Math.floor((pointer.worldX - BOARD_PADDING) / this.hucreBoyu)
    const satir = Math.floor((pointer.worldY - BOARD_PADDING) / this.hucreBoyu)
    if (sutun < 0 || sutun >= this.oyun.sutun || satir < 0 || satir >= this.oyun.satir) return -1
    return this.oyun.index(satir, sutun)
  }

  private basildi(pointer: Phaser.Input.Pointer): void {
    if (this.oyun.bitti) return
    const index = this.indexBul(pointer)
    if (index < 0) return

    this.basilanIndex = index
    this.uzunBasmaYapildi = false

    if (pointer.rightButtonDown()) {
      this.bayrakKoy(index)
      this.uzunBasmaYapildi = true
      return
    }

    // Dokunmatikte basılı tutmak bayrak koyar.
    this.uzunBasmaTimer = this.time.delayedCall(UZUN_BASMA_MS, () => {
      this.uzunBasmaYapildi = true
      this.bayrakKoy(index)
    })
  }

  private birakildi(pointer: Phaser.Input.Pointer): void {
    this.uzunBasmaTimer?.remove()
    this.uzunBasmaTimer = undefined
    if (this.oyun.bitti || this.uzunBasmaYapildi) return

    const index = this.indexBul(pointer)
    if (index < 0 || index !== this.basilanIndex) return
    this.ac(index)
  }

  // --- Oyun akışı ---

  private ac(index: number): void {
    this.sayac.basla()
    const sonuc = this.oyun.ac(index)
    if (!sonuc.degisti) return

    this.render()
    for (const [sira, acilan] of sonuc.acilanlar.entries()) {
      const view = this.gorunumler[acilan]
      view.zemin.setScale(0.7)
      this.tweens.add({
        targets: view.zemin,
        scale: 1,
        duration: ACILMA_SURESI,
        delay: Math.min(sira * 6, 220),
        ease: 'Quad.easeOut',
      })
    }

    if (sonuc.patladi) this.kaybetti()
    else if (this.oyun.durum === 'kazandi') this.kazandi()
  }

  private bayrakKoy(index: number): void {
    if (!this.oyun.bayrakDegistir(index)) return
    this.sayac.basla()
    this.render()
    setChip('flags', this.oyun.kalanMayin)
  }

  private kaybetti(): void {
    this.sayac.durdur()
    this.cameras.main.shake(PATLAMA_SARSINTI_MS, PATLAMA_SARSINTI)
    this.time.delayedCall(PATLAMA_SARSINTI_MS + 120, () => {
      this.hud.showOverlay({
        title: 'Mayına bastın 💥',
        text: `${ZORLUKLAR[this.zorluk].ad} · Süre: ${this.sayac.yazi}`,
        primaryLabel: 'Tekrar dene',
        onPrimary: () => this.startNewGame(),
      })
    })
  }

  private kazandi(): void {
    this.sayac.durdur()
    const score = skorHesapla(this.zorluk, this.sayac.saniye)
    this.hud.setScore(score)
    const ozet = `${ZORLUKLAR[this.zorluk].ad} · ${this.sayac.yazi} · Skor: ${score}`

    this.time.delayedCall(320, () => {
      this.recorder.finish(score, {
        title: 'Tarlayı temizledin! 🎉',
        text: `${ozet} — skor tablosuna girdin!`,
        onDone: () =>
          this.hud.showOverlay({
            title: 'Tarlayı temizledin! 🎉',
            text: ozet,
            primaryLabel: 'Yeni oyun',
            onPrimary: () => this.startNewGame(),
          }),
      })
    })
  }

  private startNewGame(): void {
    this.hud.hideOverlay()
    this.tweens.killAll()
    this.kur()
  }

  // --- Görünüm ---

  private render(): void {
    for (let index = 0; index < this.oyun.toplam; index++) {
      const hucre = this.oyun.hucreler[index]
      const view = this.gorunumler[index]
      const { satir, sutun } = this.oyun.konum(index)

      if (!hucre.acik) {
        // Satranç deseni: kapalı hücreler tekdüze görünmesin.
        view.zemin.setFillStyle((satir + sutun) % 2 === 0 ? COLORS.KAPALI : COLORS.KAPALI_ALT)
        view.yazi.setText(hucre.bayrak ? '⚑' : '')
        view.yazi.setColor(`#${COLORS.BAYRAK.toString(16).padStart(6, '0')}`)
        continue
      }

      if (hucre.mayin) {
        view.zemin.setFillStyle(index === this.oyun.patlayan ? COLORS.MAYIN_PATLAYAN : COLORS.MAYIN)
        view.yazi.setText('✻').setColor('#2a1c1c')
        continue
      }

      view.zemin.setFillStyle(COLORS.ACIK)
      view.yazi.setText(hucre.komsu > 0 ? String(hucre.komsu) : '')
      view.yazi.setColor(SAYI_RENKLERI[hucre.komsu] ?? '#ffffff')
    }
  }

  private tazeleSure(): void {
    if (!this.oyun.bitti) setChip('timer', this.sayac.yazi)
  }

  private x(sutun: number): number {
    return BOARD_PADDING + sutun * this.hucreBoyu + this.hucreBoyu / 2
  }

  private y(satir: number): number {
    return BOARD_PADDING + satir * this.hucreBoyu + this.hucreBoyu / 2
  }
}
