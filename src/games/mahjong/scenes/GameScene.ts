import * as Phaser from 'phaser'

import { TemelSahne } from '../../../shared/TemelSahne.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { setChip } from '../../../shared/dom.ts'
import {
  COLORS,
  ESLESME_SURESI,
  FONT_FAMILY,
  GAME_HEIGHT,
  GAME_WIDTH,
  KAT_KAYMA_X,
  KAT_KAYMA_Y,
  SATIR,
  SECIM_BUYUME,
  SIMGE_FONT,
  SUTUN,
  TAS_GENISLIK,
  TAS_YUKSEKLIK,
  UST_BOSLUK,
  skorHesapla,
} from '../config/constants.ts'
import { Mahjong } from '../systems/Mahjong.ts'

export class GameScene extends TemelSahne {
  private readonly oyun = new Mahjong()
  private katman!: Phaser.GameObjects.Container
  /** İpucu düğmesinin vurguladığı çift. */
  private ipucu: [number, number] | null = null

  constructor() {
    super('mahjong')
  }

  protected kur(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(14)
    this.katman = this.add.container(0, 0)
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.dokun(p))
    this.ipucuDugmesi()
  }

  protected yeniOyun(): void {
    this.oyun.dagit()
    this.ipucu = null
    setChip('remaining', this.oyun.kalan)
    setChip('timer', '0:00')
    this.skorGoster(0)
    this.ciz()
  }

  // --- Yerleşim ---

  private solX(): number {
    return (GAME_WIDTH - SUTUN * TAS_GENISLIK) / 2
  }

  /** Üst katlar sola-yukarı kayar; derinlik böyle görünür. */
  private x(sutun: number, kat: number): number {
    return this.solX() + sutun * TAS_GENISLIK + TAS_GENISLIK / 2 - kat * KAT_KAYMA_X
  }

  private y(satir: number, kat: number): number {
    return UST_BOSLUK + satir * TAS_YUKSEKLIK + TAS_YUKSEKLIK / 2 - kat * KAT_KAYMA_Y
  }

  // --- Girdi ---

  /**
   * Dokunulan taşı bulur. Üst katlar önce denenir: üstteki taş alttakini
   * görsel olarak kapattığı için dokunuş da ona gitmeli.
   */
  private tasBul(px: number, py: number): number {
    for (let kat = SATIR; kat >= 0; kat--) {
      for (const [index, tas] of this.oyun.taslar.entries()) {
        if (tas.alindi || tas.kat !== kat) continue
        const merkezX = this.x(tas.sutun, tas.kat)
        const merkezY = this.y(tas.satir, tas.kat)
        if (
          Math.abs(px - merkezX) <= TAS_GENISLIK / 2 &&
          Math.abs(py - merkezY) <= TAS_YUKSEKLIK / 2
        ) {
          return index
        }
      }
    }
    return -1
  }

  private dokun(p: Phaser.Input.Pointer): void {
    if (this.bitti) return
    const index = this.tasBul(p.worldX, p.worldY)
    if (index === -1) return

    const sonuc = this.oyun.sec(index)
    if (sonuc === 'yok') {
      sesler.yanlis()
      return
    }
    this.sayac.basla()
    this.ipucu = null

    if (sonuc === 'eslesti') {
      sesler.dogru()
      setChip('remaining', this.oyun.kalan)
      this.skorGoster(skorHesapla(this.oyun.eslesenCift, this.sayac.saniye))
    } else {
      sesler.tik()
    }
    this.ciz()

    if (this.oyun.bitti) {
      const skor = skorHesapla(this.oyun.eslesenCift, this.sayac.saniye)
      this.turuBitir({
        baslik: 'Tahtayı boşalttın! 🎉',
        ozet: `${this.oyun.eslesenCift} çift · ${this.sayac.yazi} · Skor: ${skor}`,
        skor,
      })
      return
    }

    if (!this.oyun.hamleVarMi) {
      // Kilitlenme: kalan taşların simgeleri yeniden dağıtılır, oyun sürer
      this.oyun.karistirKalanlari()
      sesler.kaydir()
      this.ciz()
    }
  }

  /** Sayfadaki "İpucu" düğmesi oynanabilir bir çifti yakar. */
  private ipucuDugmesi(): void {
    const dugme = document.querySelector<HTMLButtonElement>('#pad button[data-move="ipucu"]')
    if (!dugme) return
    const tikla = (): void => {
      if (this.bitti) return
      this.ipucu = this.oyun.ipucuCifti()
      if (!this.ipucu) {
        sesler.yanlis()
        return
      }
      sesler.tik()
      this.ciz()
    }
    dugme.addEventListener('click', tikla)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => dugme.removeEventListener('click', tikla))
  }

  // --- Çizim ---

  private ciz(): void {
    this.katman.removeAll(true)

    // Alt kattan üste: sonra çizilen üste gelir, yığın doğru görünür
    const sirali = this.oyun.taslar
      .map((tas, index) => ({ tas, index }))
      .filter(({ tas }) => !tas.alindi)
      .sort((a, b) => a.tas.kat - b.tas.kat || a.tas.satir - b.tas.satir || a.tas.sutun - b.tas.sutun)

    for (const { tas, index } of sirali) {
      const merkezX = this.x(tas.sutun, tas.kat)
      const merkezY = this.y(tas.satir, tas.kat)
      const serbest = this.oyun.serbestMi(index)
      const secili = this.oyun.secili === index
      const isaretli = this.ipucu?.includes(index) ?? false

      // Gölge: üst kat taşı alttakinin üstüne düşer, yığın böyle okunur
      if (tas.kat > 0) {
        this.katman.add(
          this.add
            .rectangle(
              merkezX + KAT_KAYMA_X,
              merkezY + KAT_KAYMA_Y,
              TAS_GENISLIK - 2,
              TAS_YUKSEKLIK - 4,
              COLORS.GOLGE,
            )
            .setRounded(8)
            .setAlpha(0.45),
        )
      }

      // Yan yüz: taşın kalınlığı
      this.katman.add(
        this.add
          .rectangle(
            merkezX + 4,
            merkezY + 5,
            TAS_GENISLIK - 4,
            TAS_YUKSEKLIK - 6,
            COLORS.TAS_YAN[Math.min(tas.kat, COLORS.TAS_YAN.length - 1)],
          )
          .setRounded(7),
      )

      const yuz = this.add
        .rectangle(
          merkezX,
          merkezY,
          TAS_GENISLIK - 4,
          TAS_YUKSEKLIK - 6,
          serbest ? COLORS.TAS[Math.min(tas.kat, COLORS.TAS.length - 1)] : COLORS.TAS_KAPALI,
        )
        .setRounded(7)
        .setStrokeStyle(
          secili || isaretli ? 3 : 1,
          secili ? COLORS.TAS_SECILI : isaretli ? COLORS.TAS_IPUCU : COLORS.TAS_KENAR,
          secili || isaretli ? 1 : 0.7,
        )
      if (secili) yuz.setScale(SECIM_BUYUME)
      this.katman.add(yuz)

      this.katman.add(
        this.add
          .text(merkezX, merkezY, tas.simge, {
            fontFamily: FONT_FAMILY,
            fontSize: `${SIMGE_FONT}px`,
          })
          .setOrigin(0.5)
          // Kapalı taş soluk: hangisinin alınabildiği bir bakışta anlaşılsın
          .setAlpha(serbest ? 1 : 0.45),
      )

      if (isaretli) {
        this.tweens.add({
          targets: yuz,
          scale: SECIM_BUYUME,
          duration: ESLESME_SURESI,
          yoyo: true,
          repeat: 2,
          ease: 'Sine.easeInOut',
        })
      }
    }
  }
}
