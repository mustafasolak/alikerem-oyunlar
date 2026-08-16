import * as Phaser from 'phaser'

import { GameHud } from '../../../shared/GameHud.ts'
import { Sayac } from '../../../shared/Sayac.ts'
import { ScoreRecorder } from '../../../shared/ScoreRecorder.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { element, setChip } from '../../../shared/dom.ts'
import {
  BOARD_PADDING,
  BOARD_RADIUS,
  BULMA_POP_MS,
  BULMA_POP_SCALE,
  CELL,
  COLORS,
  FONT_FAMILY,
  GAME_HEIGHT,
  GAME_WIDTH,
  GRID_SIZE,
  HARF_FONT,
  skorHesapla,
} from '../config/constants.ts'
import { WordSearch, type Hucre } from '../systems/WordSearch.ts'

interface HucreGorunumu {
  zemin: Phaser.GameObjects.Rectangle
  yazi: Phaser.GameObjects.Text
}

export class GameScene extends Phaser.Scene {
  private readonly oyun = new WordSearch()
  private readonly sayac = new Sayac()

  private hud!: GameHud
  private recorder!: ScoreRecorder
  private gorunumler: HucreGorunumu[][] = []
  private bas: Hucre | null = null
  private secim: Hucre[] = []
  private bitti = false

  constructor() {
    super('KelimeAvi')
  }

  create(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(BOARD_RADIUS)
    this.kurIzgara()

    this.hud = new GameHud({ onRestart: () => this.startNewGame() })
    this.hud.setScore(0)
    this.recorder = new ScoreRecorder('kelimeavi', this.hud, (typing) => this.setTyping(typing))

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.secmeyeBasla(p))
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => this.secimiSurdur(p))
    this.input.on('pointerup', () => this.secimiBitir())

    this.time.addEvent({ delay: 250, loop: true, callback: () => this.tazeleSure() })
    this.yeniBulmaca()
  }

  // --- Kurulum ---

  private kurIzgara(): void {
    for (let satir = 0; satir < GRID_SIZE; satir++) {
      const sira: HucreGorunumu[] = []
      for (let sutun = 0; sutun < GRID_SIZE; sutun++) {
        const x = this.x(sutun)
        const y = this.y(satir)
        const zemin = this.add.rectangle(x, y, CELL - 3, CELL - 3, COLORS.HUCRE).setRounded(6)
        const yazi = this.add
          .text(x, y, '', {
            fontFamily: FONT_FAMILY,
            fontSize: `${HARF_FONT}px`,
            fontStyle: 'bold',
            color: COLORS.HARF,
          })
          .setOrigin(0.5)
        sira.push({ zemin, yazi })
      }
      this.gorunumler.push(sira)
    }
  }

  private setTyping(typing: boolean): void {
    const keyboard = this.input.keyboard
    if (keyboard) keyboard.enabled = !typing
  }

  // --- Girdi ---

  private hucreBul(pointer: Phaser.Input.Pointer): Hucre | null {
    const sutun = Math.floor((pointer.worldX - BOARD_PADDING) / CELL)
    const satir = Math.floor((pointer.worldY - BOARD_PADDING) / CELL)
    if (sutun < 0 || sutun >= GRID_SIZE || satir < 0 || satir >= GRID_SIZE) return null
    return { satir, sutun }
  }

  private secmeyeBasla(pointer: Phaser.Input.Pointer): void {
    if (this.bitti) return
    this.sayac.basla()
    this.bas = this.hucreBul(pointer)
    this.secim = this.bas ? [this.bas] : []
    this.render()
  }

  private secimiSurdur(pointer: Phaser.Input.Pointer): void {
    if (!this.bas || this.bitti) return
    const son = this.hucreBul(pointer)
    if (!son) return
    this.secim = this.oyun.cizgi(this.bas, son) ?? [this.bas]
    this.render()
  }

  private secimiBitir(): void {
    if (!this.bas || this.bitti) return
    const son = this.secim.at(-1)
    const yerlesim = son ? this.oyun.secimiDene(this.bas, son) : null

    this.bas = null
    this.secim = []
    this.render()

    if (!yerlesim) return

    sesler.dogru()
    for (const [sira, hucre] of yerlesim.hucreler.entries()) {
      const view = this.gorunumler[hucre.satir][hucre.sutun]
      this.tweens.add({
        targets: view.zemin,
        scale: BULMA_POP_SCALE,
        duration: BULMA_POP_MS / 2,
        delay: sira * 25,
        yoyo: true,
        ease: 'Quad.easeOut',
      })
    }

    this.hud.showGain(100)
    this.tazeleSkor()
    this.kelimeListesiniTazele()
    if (this.oyun.tamamlandi) this.tamamlandi()
  }

  // --- Oyun akışı ---

  private yeniBulmaca(): void {
    this.oyun.reset()
    this.sayac.sifirla()
    this.bitti = false
    this.bas = null
    this.secim = []
    this.hud.setScore(0)
    setChip('remaining', this.oyun.kalan)
    setChip('timer', '0:00')
    this.kelimeListesiniTazele()
    this.render()
  }

  private tamamlandi(): void {
    sesler.zafer()
    this.bitti = true
    this.sayac.durdur()
    const score = skorHesapla(this.oyun.bulunanlar.size, this.sayac.saniye, true)
    this.hud.setScore(score)
    const ozet = `${this.oyun.kategori} · ${this.sayac.yazi} · Skor: ${score}`

    this.time.delayedCall(420, () => {
      this.recorder.finish(score, {
        title: 'Hepsini buldun! 🎉',
        text: `${ozet} — skor tablosuna girdin!`,
        onDone: () =>
          this.hud.showOverlay({
            title: 'Hepsini buldun! 🎉',
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
    this.time.removeAllEvents()
    this.time.addEvent({ delay: 250, loop: true, callback: () => this.tazeleSure() })
    this.yeniBulmaca()
  }

  // --- Görünüm ---

  private render(): void {
    const secili = new Set(this.secim.map((h) => `${h.satir},${h.sutun}`))
    const bulunan = new Set(this.oyun.bulunanHucreler().map((h) => `${h.satir},${h.sutun}`))

    for (let satir = 0; satir < GRID_SIZE; satir++) {
      for (let sutun = 0; sutun < GRID_SIZE; sutun++) {
        const view = this.gorunumler[satir][sutun]
        const anahtar = `${satir},${sutun}`
        view.yazi.setText(this.oyun.izgara[satir]?.[sutun] ?? '')

        if (secili.has(anahtar)) {
          view.zemin.setFillStyle(COLORS.SECILI)
          view.yazi.setColor('#10241f')
        } else if (bulunan.has(anahtar)) {
          view.zemin.setFillStyle(COLORS.BULUNAN)
          view.yazi.setColor(COLORS.HARF_BULUNAN)
        } else {
          view.zemin.setFillStyle(COLORS.HUCRE)
          view.yazi.setColor(COLORS.HARF)
        }
      }
    }
  }

  private kelimeListesiniTazele(): void {
    const liste = element<HTMLUListElement>('word-list')
    liste.replaceChildren()
    for (const kelime of this.oyun.kelimeler) {
      const item = document.createElement('li')
      item.textContent = kelime
      if (this.oyun.bulundu(kelime)) item.classList.add('is-found')
      liste.append(item)
    }
    setChip('remaining', this.oyun.kalan)
  }

  private tazeleSkor(): void {
    this.hud.setScore(skorHesapla(this.oyun.bulunanlar.size, this.sayac.saniye, false))
  }

  private tazeleSure(): void {
    if (!this.bitti) setChip('timer', this.sayac.yazi)
  }

  private x(sutun: number): number {
    return BOARD_PADDING + sutun * CELL + CELL / 2
  }

  private y(satir: number): number {
    return BOARD_PADDING + satir * CELL + CELL / 2
  }
}
