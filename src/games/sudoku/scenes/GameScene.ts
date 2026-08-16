import * as Phaser from 'phaser'

import { GameHud } from '../../../shared/GameHud.ts'
import { KeyPad } from '../../../shared/KeyPad.ts'
import { Sayac } from '../../../shared/Sayac.ts'
import { ScoreRecorder } from '../../../shared/ScoreRecorder.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { butonGrubu, setChip } from '../../../shared/dom.ts'
import {
  BOARD_PADDING,
  BOARD_RADIUS,
  BOYUT,
  CELL,
  COLORS,
  FONT_FAMILY,
  GAME_HEIGHT,
  GAME_WIDTH,
  HATA_SARSINTI,
  HATA_SARSINTI_MS,
  IZGARA_INCE,
  IZGARA_KALIN,
  KUTU,
  NOT_FONT,
  NOT_FONT_FAMILY,
  NOT_SATIR_ARALIGI,
  RAKAM_FONT,
  TAMAMLAMA_POP_MS,
  VARSAYILAN_ZORLUK,
  ZORLUKLAR,
  skorHesapla,
  type Zorluk,
} from '../config/constants.ts'
import { SudokuGame } from '../systems/SudokuGame.ts'

interface HucreGorunumu {
  zemin: Phaser.GameObjects.Rectangle
  yazi: Phaser.GameObjects.Text
  /** Kalem notları: hücre içinde 3 satırlık küçük rakam ızgarası. */
  not: Phaser.GameObjects.Text
}

const SIL = 'sil'
const NOT = 'not'

export class GameScene extends Phaser.Scene {
  private readonly sayac = new Sayac()

  private oyun!: SudokuGame
  private hud!: GameHud
  private recorder!: ScoreRecorder
  private keypad?: KeyPad
  private gorunumler: HucreGorunumu[] = []
  private secili = -1
  private bitti = false
  private yaziyor = false
  /** Kalem modu: rakam tuşu değer yerine not yazar. */
  private notModu = false

  constructor() {
    super('Sudoku')
  }

  create(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(BOARD_RADIUS)
    this.kurIzgara()
    this.cizgileriCiz()

    this.oyun = new SudokuGame(VARSAYILAN_ZORLUK)
    this.hud = new GameHud({ onRestart: () => this.startNewGame() })
    this.hud.setScore(0)
    this.recorder = new ScoreRecorder('sudoku', this.hud, (typing) => this.setTyping(typing))

    this.kurKeypad()
    this.bindKeyboard()
    butonGrubu('toolbar', 'level', (value) => this.startNewGame(value as Zorluk))

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.hucreSec(p))
    this.time.addEvent({ delay: 250, loop: true, callback: () => this.tazeleSure() })

    this.yeniBulmaca(VARSAYILAN_ZORLUK)
  }

  // --- Kurulum ---

  private kurIzgara(): void {
    for (let index = 0; index < BOYUT * BOYUT; index++) {
      const satir = Math.floor(index / BOYUT)
      const sutun = index % BOYUT
      const x = this.x(sutun)
      const y = this.y(satir)
      const zemin = this.add.rectangle(x, y, CELL - 2, CELL - 2, COLORS.HUCRE).setRounded(4)
      const yazi = this.add
        .text(x, y, '', {
          fontFamily: FONT_FAMILY,
          fontSize: `${RAKAM_FONT}px`,
          fontStyle: 'bold',
          color: COLORS.IPUCU_YAZI,
        })
        .setOrigin(0.5)
      const not = this.add
        .text(x, y, '', {
          fontFamily: NOT_FONT_FAMILY,
          fontSize: `${NOT_FONT}px`,
          color: COLORS.NOT_YAZI,
          align: 'center',
        })
        .setOrigin(0.5)
        .setLineSpacing(NOT_SATIR_ARALIGI)
      this.gorunumler.push({ zemin, yazi, not })
    }
  }

  /** 3×3 kutuları ayıran kalın çizgiler. */
  private cizgileriCiz(): void {
    const g = this.add.graphics()
    for (let i = 0; i <= BOYUT; i++) {
      const kalin = i % KUTU === 0
      g.lineStyle(kalin ? IZGARA_KALIN : IZGARA_INCE, COLORS.KUTU_CIZGI, kalin ? 1 : 0.6)
      const p = BOARD_PADDING + i * CELL
      g.lineBetween(p, BOARD_PADDING, p, GAME_HEIGHT - BOARD_PADDING)
      g.lineBetween(BOARD_PADDING, p, GAME_WIDTH - BOARD_PADDING, p)
    }
  }

  private kurKeypad(): void {
    const container = document.getElementById('keypad')
    if (!container) return
    this.keypad = new KeyPad({
      container,
      keys: [
        ...Array.from({ length: BOYUT }, (_, i) => String(i + 1)),
        { label: 'Sil', value: SIL, span: 4 },
        { label: '✏️ Kalem notu', value: NOT, span: 5 },
      ],
      columns: BOYUT,
      onPress: (value) => {
        if (value === NOT) this.notModunuDegistir()
        else if (value === SIL) this.sil()
        else this.yaz(Number(value))
      },
    })
    this.keypad.setPressed(NOT, this.notModu)
  }

  private bindKeyboard(): void {
    const keyboard = this.input.keyboard
    if (!keyboard) return
    keyboard.on('keydown', (event: KeyboardEvent) => {
      if (this.yaziyor || event.metaKey || event.ctrlKey || event.altKey) return
      if (event.key >= '1' && event.key <= '9') this.yaz(Number(event.key))
      else if (event.key === 'Backspace' || event.key === 'Delete' || event.key === '0') this.sil()
      else if (event.key === 'n' || event.key === 'N') this.notModunuDegistir()
    })
  }

  private setTyping(typing: boolean): void {
    this.yaziyor = typing
    const keyboard = this.input.keyboard
    if (keyboard) keyboard.enabled = !typing
    this.keypad?.setEnabled(!typing)
  }

  // --- Girdi ---

  private hucreSec(pointer: Phaser.Input.Pointer): void {
    if (this.bitti) return
    const sutun = Math.floor((pointer.worldX - BOARD_PADDING) / CELL)
    const satir = Math.floor((pointer.worldY - BOARD_PADDING) / CELL)
    if (sutun < 0 || sutun >= BOYUT || satir < 0 || satir >= BOYUT) return
    this.secili = satir * BOYUT + sutun
    this.render()
  }

  private notModunuDegistir(): void {
    if (this.bitti || this.yaziyor) return
    this.notModu = !this.notModu
    this.keypad?.setPressed(NOT, this.notModu)
    sesler.tik()
  }

  /**
   * Sil tuşu: hücrede rakam varsa onu, yoksa notları temizler.
   * Böylece tek tuş iki işi de görür.
   */
  private sil(): void {
    if (this.bitti || this.secili < 0 || this.yaziyor) return
    if (this.oyun.tahta[this.secili] !== 0) {
      this.yaz(0)
      return
    }
    if (this.oyun.notlariTemizle(this.secili)) {
      sesler.tik()
      this.render()
    }
  }

  private yaz(deger: number): void {
    if (this.bitti || this.secili < 0 || this.yaziyor) return
    this.sayac.basla()

    // Kalem modunda rakam tuşu not koyar/kaldırır; hata sayılmaz.
    if (this.notModu && deger !== 0) {
      if (this.oyun.notDegistir(this.secili, deger)) {
        sesler.tik()
        this.render()
      }
      return
    }

    const oncekiHata = this.oyun.hata
    if (!this.oyun.yaz(this.secili, deger)) return

    if (this.oyun.hata > oncekiHata) {
      sesler.yanlis()
      this.cameras.main.shake(HATA_SARSINTI_MS, HATA_SARSINTI)
      setChip('mistakes', this.oyun.hata)
    } else if (deger !== 0) {
      sesler.tik()
    }

    this.render()
    if (this.oyun.tamamlandi) this.tamamlandi()
  }

  // --- Oyun akışı ---

  private yeniBulmaca(zorluk: Zorluk): void {
    this.oyun.yeniBulmaca(zorluk)
    this.sayac.sifirla()
    this.secili = -1
    this.bitti = false
    this.notModu = false
    this.keypad?.setPressed(NOT, false)
    this.hud.setScore(0)
    this.keypad?.setEnabled(true)
    setChip('mistakes', 0)
    setChip('timer', '0:00')
    this.render()
  }

  private tamamlandi(): void {
    sesler.zafer()
    this.bitti = true
    this.sayac.durdur()
    this.keypad?.setEnabled(false)
    const score = skorHesapla(this.oyun.zorluk, this.sayac.saniye, this.oyun.hata)
    this.hud.setScore(score)

    for (const [index, view] of this.gorunumler.entries()) {
      this.tweens.add({
        targets: view.zemin,
        scale: 1.08,
        duration: TAMAMLAMA_POP_MS / 2,
        delay: (index % BOYUT) * 20 + Math.floor(index / BOYUT) * 20,
        yoyo: true,
        ease: 'Quad.easeOut',
      })
    }

    const ozet = `${ZORLUKLAR[this.oyun.zorluk].ad} · ${this.sayac.yazi} · ${this.oyun.hata} hata · Skor: ${score}`
    this.time.delayedCall(TAMAMLAMA_POP_MS + 400, () => {
      this.recorder.finish(score, {
        title: 'Çözdün! 🎉',
        text: `${ozet} — skor tablosuna girdin!`,
        onDone: () =>
          this.hud.showOverlay({
            title: 'Çözdün! 🎉',
            text: ozet,
            primaryLabel: 'Yeni bulmaca',
            onPrimary: () => this.startNewGame(),
          }),
      })
    })
  }

  private startNewGame(zorluk: Zorluk = this.oyun.zorluk): void {
    this.hud.hideOverlay()
    this.tweens.killAll()
    this.yeniBulmaca(zorluk)
  }

  // --- Görünüm ---

  private render(): void {
    const seciliDeger = this.secili >= 0 ? this.oyun.tahta[this.secili] : 0

    for (let index = 0; index < this.oyun.toplam; index++) {
      const view = this.gorunumler[index]
      const deger = this.oyun.tahta[index]

      if (index === this.secili) view.zemin.setFillStyle(COLORS.HUCRE_SECILI)
      else if (seciliDeger !== 0 && deger === seciliDeger) view.zemin.setFillStyle(COLORS.HUCRE_AYNI)
      else if (this.secili >= 0 && this.oyun.iliskiliMi(this.secili, index)) {
        view.zemin.setFillStyle(COLORS.HUCRE_VURGU)
      } else view.zemin.setFillStyle(COLORS.HUCRE)

      view.yazi.setText(deger === 0 ? '' : String(deger))
      if (this.oyun.hataliMi(index)) view.yazi.setColor(COLORS.HATA_YAZI)
      else if (this.oyun.ipucuMu(index)) view.yazi.setColor(COLORS.IPUCU_YAZI)
      else view.yazi.setColor(COLORS.GIRILEN_YAZI)

      view.not.setText(deger === 0 ? this.notYazisi(index) : '')
    }
  }

  /** Notları 3×3 ızgara gibi dizer; olmayan rakamın yeri boş kalır. */
  private notYazisi(index: number): string {
    if (this.oyun.notlar[index].size === 0) return ''
    const satirlar: string[] = []
    for (let satir = 0; satir < KUTU; satir++) {
      const hucreler: string[] = []
      for (let sutun = 0; sutun < KUTU; sutun++) {
        const deger = satir * KUTU + sutun + 1
        hucreler.push(this.oyun.notVar(index, deger) ? String(deger) : ' ')
      }
      satirlar.push(hucreler.join(' '))
    }
    return satirlar.join('\n')
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
