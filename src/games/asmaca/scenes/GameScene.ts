import * as Phaser from 'phaser'

import { GameHud } from '../../../shared/GameHud.ts'
import { KeyPad } from '../../../shared/KeyPad.ts'
import { ScoreRecorder } from '../../../shared/ScoreRecorder.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { setChip } from '../../../shared/dom.ts'
import { TURKCE_ALFABE } from '../../../shared/kelimeler.ts'
import {
  BACAK_UZUNLUK,
  CIZGI_KALINLIK,
  COLORS,
  DARAGACI,
  FONT_FAMILY,
  GAME_WIDTH,
  GOVDE_UZUNLUK,
  HARF_ARALIK,
  HARF_FONT,
  HARF_GENISLIK,
  HARF_Y,
  KAFA_YARICAP,
  KATEGORI_FONT,
  KATEGORI_Y,
  KOL_UZUNLUK,
  MAX_CAN,
  PARCA_BELIRME_MS,
  skorHesapla,
} from '../config/constants.ts'
import { HangmanGame, buyuk } from '../systems/HangmanGame.ts'

export class GameScene extends Phaser.Scene {
  private readonly oyun = new HangmanGame()

  private hud!: GameHud
  private recorder!: ScoreRecorder
  private keypad?: KeyPad
  private adamKatmani!: Phaser.GameObjects.Container
  private harfKatmani!: Phaser.GameObjects.Container
  private kategoriYazi!: Phaser.GameObjects.Text
  private yaziyor = false

  constructor() {
    super('Asmaca')
  }

  create(): void {
    this.daragaciCiz()
    this.adamKatmani = this.add.container(0, 0)
    this.harfKatmani = this.add.container(0, 0)
    this.kategoriYazi = this.add
      .text(GAME_WIDTH / 2, KATEGORI_Y, '', {
        fontFamily: FONT_FAMILY,
        fontSize: `${KATEGORI_FONT}px`,
        color: COLORS.KATEGORI,
        align: 'center',
        wordWrap: { width: GAME_WIDTH - 60 },
      })
      .setOrigin(0.5)

    this.hud = new GameHud({ onRestart: () => this.startNewGame() })
    this.hud.setScore(0)
    this.recorder = new ScoreRecorder('asmaca', this.hud, (typing) => this.setTyping(typing))

    this.kurKeypad()
    this.bindKeyboard()
    this.render()
  }

  // --- Kurulum ---

  private kurKeypad(): void {
    const container = document.getElementById('keypad')
    if (!container) return
    this.keypad = new KeyPad({
      container,
      keys: TURKCE_ALFABE,
      columns: 8,
      onPress: (harf) => this.tahminEt(harf),
    })
  }

  private bindKeyboard(): void {
    const keyboard = this.input.keyboard
    if (!keyboard) return
    // Türkçe harfler için ham klavye olayını dinliyoruz; Phaser tuş adları yetmiyor.
    keyboard.on('keydown', (event: KeyboardEvent) => {
      if (this.yaziyor || event.metaKey || event.ctrlKey || event.altKey) return
      const harf = buyuk(event.key)
      if (harf.length === 1 && TURKCE_ALFABE.includes(harf)) this.tahminEt(harf)
    })
  }

  private setTyping(typing: boolean): void {
    this.yaziyor = typing
    const keyboard = this.input.keyboard
    if (keyboard) keyboard.enabled = !typing
    this.keypad?.setEnabled(!typing)
  }

  // --- Oyun akışı ---

  private tahminEt(harf: string): void {
    if (this.oyun.bitti || this.yaziyor) return
    const sonuc = this.oyun.tahmin(harf)
    if (!sonuc.gecerli) return

    if (sonuc.dogru) sesler.dogru()
    else sesler.yanlis()
    this.keypad?.setState(harf, sonuc.dogru ? 'correct' : 'wrong')
    setChip('lives', this.oyun.kalanCan)
    this.render()

    if (!sonuc.dogru) this.cameras.main.shake(140, 0.006)
    if (sonuc.durum === 'kazandi') this.kazandi()
    else if (sonuc.durum === 'kaybetti') this.kaybetti()
  }

  private kazandi(): void {
    sesler.zafer()
    const score = skorHesapla(this.oyun.kalanCan, this.oyun.kelime.length)
    this.hud.setScore(score)
    this.keypad?.setEnabled(false)
    const ozet = `${this.oyun.kelime} · ${this.oyun.kalanCan} can kaldı · Skor: ${score}`

    this.time.delayedCall(320, () => {
      this.recorder.finish(score, {
        title: 'Bildin! 🎉',
        text: `${ozet} — skor tablosuna girdin!`,
        onDone: () =>
          this.hud.showOverlay({
            title: 'Bildin! 🎉',
            text: ozet,
            primaryLabel: 'Yeni kelime',
            onPrimary: () => this.startNewGame(),
          }),
      })
    })
  }

  private kaybetti(): void {
    sesler.carpma()
    this.keypad?.setEnabled(false)
    this.render()
    this.time.delayedCall(420, () => {
      this.hud.showOverlay({
        title: 'Adam asıldı 😕',
        text: `Kelime: ${this.oyun.kelime}`,
        primaryLabel: 'Yeni kelime',
        onPrimary: () => this.startNewGame(),
      })
    })
  }

  private startNewGame(): void {
    this.hud.hideOverlay()
    this.time.removeAllEvents()
    this.oyun.reset()
    this.keypad?.reset()
    this.keypad?.setEnabled(true)
    this.hud.setScore(0)
    setChip('lives', MAX_CAN)
    this.render()
  }

  // --- Görünüm ---

  private daragaciCiz(): void {
    const g = this.add.graphics()
    g.lineStyle(CIZGI_KALINLIK, COLORS.DARAGACI, 1)
    g.lineBetween(DARAGACI.tabanSolX, DARAGACI.tabanY, DARAGACI.tabanSagX, DARAGACI.tabanY)
    g.lineBetween(DARAGACI.direkX, DARAGACI.tabanY, DARAGACI.direkX, DARAGACI.direkUstY)
    g.lineBetween(DARAGACI.direkX, DARAGACI.direkUstY, DARAGACI.kolSagX, DARAGACI.direkUstY)
    g.lineBetween(
      DARAGACI.kolSagX,
      DARAGACI.direkUstY,
      DARAGACI.kolSagX,
      DARAGACI.direkUstY + DARAGACI.ipUzunluk,
    )
  }

  /** Yanlış sayısına göre adamın parçalarını çizer. */
  private adamCiz(): void {
    this.adamKatmani.removeAll(true)
    const merkezX = DARAGACI.kolSagX
    const kafaY = DARAGACI.direkUstY + DARAGACI.ipUzunluk + KAFA_YARICAP
    const govdeUst = kafaY + KAFA_YARICAP
    const govdeAlt = govdeUst + GOVDE_UZUNLUK

    const g = this.add.graphics()
    g.lineStyle(CIZGI_KALINLIK - 1, COLORS.ADAM, 1)

    const parcalar: (() => void)[] = [
      () => g.strokeCircle(merkezX, kafaY, KAFA_YARICAP),
      () => g.lineBetween(merkezX, govdeUst, merkezX, govdeAlt),
      () => g.lineBetween(merkezX, govdeUst + 14, merkezX - KOL_UZUNLUK, govdeUst + 44),
      () => g.lineBetween(merkezX, govdeUst + 14, merkezX + KOL_UZUNLUK, govdeUst + 44),
      () => g.lineBetween(merkezX, govdeAlt, merkezX - KOL_UZUNLUK, govdeAlt + BACAK_UZUNLUK),
      () => g.lineBetween(merkezX, govdeAlt, merkezX + KOL_UZUNLUK, govdeAlt + BACAK_UZUNLUK),
    ]

    for (let i = 0; i < Math.min(this.oyun.yanlis, parcalar.length); i++) {
      parcalar[i]()
    }
    this.adamKatmani.add(g)

    if (this.oyun.yanlis > 0) {
      g.setAlpha(0)
      this.tweens.add({ targets: g, alpha: 1, duration: PARCA_BELIRME_MS, ease: 'Quad.easeOut' })
    }
  }

  private harfleriCiz(): void {
    this.harfKatmani.removeAll(true)
    const maske = this.oyun.maske
    const toplam = maske.length * HARF_GENISLIK + (maske.length - 1) * HARF_ARALIK
    const baslangic = (GAME_WIDTH - toplam) / 2
    const kaybetti = this.oyun.durum === 'kaybetti'

    maske.forEach((harf, index) => {
      const x = baslangic + index * (HARF_GENISLIK + HARF_ARALIK) + HARF_GENISLIK / 2
      const cizgi = this.add.rectangle(x, HARF_Y + 24, HARF_GENISLIK, 4, COLORS.CIZGI).setRounded(2)
      this.harfKatmani.add(cizgi)

      const gorunen = harf ?? (kaybetti ? this.oyun.kelime[index] : '')
      if (!gorunen) return

      const yazi = this.add
        .text(x, HARF_Y, gorunen, {
          fontFamily: FONT_FAMILY,
          fontSize: `${HARF_FONT}px`,
          fontStyle: 'bold',
          color: harf ? COLORS.HARF_YAZI : COLORS.KAYIP,
        })
        .setOrigin(0.5)
      this.harfKatmani.add(yazi)
    })
  }

  private render(): void {
    this.adamCiz()
    this.harfleriCiz()
    this.kategoriYazi.setText(`${this.oyun.kayit.kategori} · ${this.oyun.kayit.ipucu}`)
    setChip('lives', this.oyun.kalanCan)
    setChip('category', this.oyun.kayit.kategori)
  }
}
