/**
 * Bütün oyunların paylaştığı sahne iskeleti:
 * HUD, skor tablosu kaydı, süre sayacı, klavye koruması ve bitiş akışı.
 *
 * Oyun sahneleri bundan türeyip `oyunId`, `kur()` ve `yeniOyun()` verir.
 */

import * as Phaser from 'phaser'

import { GameHud } from './GameHud.ts'
import { Sayac } from './Sayac.ts'
import { ScoreRecorder } from './ScoreRecorder.ts'
import { sesler } from './Sesler.ts'
import { setChip } from './dom.ts'

export interface BitisAyari {
  baslik: string
  ozet: string
  butonYazisi?: string
  /** Skor tabloya girecek mi? 0 ve altı kaydedilmez. */
  skor: number
  /** Kazanma sesi çalsın mı? (kaybedince false) */
  kazandi?: boolean
  gecikme?: number
}

export abstract class TemelSahne extends Phaser.Scene {
  protected hud!: GameHud
  protected recorder!: ScoreRecorder
  protected readonly sayac = new Sayac()

  /** Oyun bitti mi? Girdi işleyicileri bunu kontrol etmeli. */
  protected bitti = false
  /** Katmanda ad yazılıyor mu? Klavye oyuna gitmemeli. */
  protected yaziyor = false

  private readonly oyunId: string
  private yakalananTuslar: string[] = []

  constructor(oyunId: string) {
    super(oyunId)
    this.oyunId = oyunId
  }

  /** Sahne kurulumu: tahta çizimi, girdi bağlama. `create` içinden çağrılır. */
  protected abstract kur(): void

  /** Yeni tur: durum sıfırlama ve ilk çizim. */
  protected abstract yeniOyun(): void

  create(): void {
    this.kur()

    this.hud = new GameHud({ onRestart: () => this.yenidenBasla() })
    this.hud.setScore(0)
    this.recorder = new ScoreRecorder(this.oyunId, this.hud, (typing) => this.yazmaModu(typing))

    this.time.addEvent({ delay: 250, loop: true, callback: () => this.sureyiTazele() })
    this.yeniOyun()
  }

  // --- Yardımcılar ---

  /** Sayfayı kaydırmasın diye tarayıcıdan alınacak tuşlar. */
  protected tuslariYakala(tuslar: string[]): void {
    this.yakalananTuslar = tuslar
    this.input.keyboard?.addCapture(tuslar)
  }

  /** Ad yazarken oyun tuşları devre dışı kalsın. */
  protected yazmaModu(typing: boolean): void {
    this.yaziyor = typing
    const keyboard = this.input.keyboard
    if (!keyboard) return
    keyboard.enabled = !typing
    if (this.yakalananTuslar.length === 0) return
    if (typing) keyboard.removeCapture(this.yakalananTuslar)
    else keyboard.addCapture(this.yakalananTuslar)
  }

  /**
   * Sayfadaki "↩︎ Geri al" düğmesini bağlar (arayüz bildiriminde
   * `pad: [{ deger: 'geri' }]` olan oyunlar için).
   */
  protected geriAlDugmesi(geriAl: () => void): void {
    const dugme = document.querySelector<HTMLButtonElement>('#pad button[data-move="geri"]')
    if (!dugme) return
    const tikla = (): void => geriAl()
    dugme.addEventListener('click', tikla)
    this.input.keyboard?.on('keydown-Z', () => geriAl())
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => dugme.removeEventListener('click', tikla))
  }

  /** Geri alınacak hamle kalmadıysa düğmeyi kapatır. */
  protected geriAlDurumu(acik: boolean): void {
    const dugme = document.querySelector<HTMLButtonElement>('#pad button[data-move="geri"]')
    if (dugme) dugme.disabled = !acik
  }

  protected skorGoster(skor: number): void {
    this.hud.setScore(skor)
  }

  protected sureyiTazele(): void {
    if (!this.bitti) setChip('timer', this.sayac.yazi)
  }

  protected yenidenBasla(): void {
    this.hud.hideOverlay()
    this.tweens.killAll()
    this.time.removeAllEvents()
    this.time.addEvent({ delay: 250, loop: true, callback: () => this.sureyiTazele() })
    this.bitti = false
    this.sayac.sifirla()
    this.yeniOyun()
  }

  /**
   * Turu bitirir: sesi çalar, skoru kaydeder (gerekiyorsa ad sorar) ve
   * sonuç katmanını gösterir.
   */
  protected turuBitir(ayar: BitisAyari): void {
    this.bitti = true
    this.sayac.durdur()
    if (ayar.kazandi === false) sesler.carpma()
    else sesler.zafer()

    this.hud.setScore(Math.max(0, ayar.skor))
    const buton = ayar.butonYazisi ?? 'Yeni oyun'

    this.time.delayedCall(ayar.gecikme ?? 340, () => {
      this.recorder.finish(ayar.skor, {
        title: ayar.baslik,
        text: `${ayar.ozet} — skor tablosuna girdin!`,
        sure: this.sayac.saniye,
        onDone: () =>
          this.hud.showOverlay({
            title: ayar.baslik,
            text: ayar.ozet,
            primaryLabel: buton,
            onPrimary: () => this.yenidenBasla(),
          }),
      })
    })
  }
}
