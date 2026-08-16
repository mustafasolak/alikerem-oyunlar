/**
 * Oyun sesleri. Dosya yok, bağımlılık yok: hepsi WebAudio ile anlık üretiliyor.
 *
 * iOS/Safari ses bağlamını ancak bir kullanıcı hareketinden sonra çalıştırır;
 * bu yüzden bağlam ilk dokunuşta/tuşta kurulur ve askıdaysa uyandırılır.
 */

import { readString, writeString } from './safeStorage.ts'

const SESSIZ_ANAHTAR = 'oyunlar.ses'

type Dalga = 'sine' | 'square' | 'sawtooth' | 'triangle'

interface TonAyari {
  frekans: number
  /** Varsa frekans buraya doğru kayar. */
  bitisFrekans?: number
  sure: number
  tip?: Dalga
  ses?: number
  gecikme?: number
}

/** Do majör beşli — zafer ezgisi için. */
const ZAFER_NOTALARI = [523.25, 659.25, 783.99, 1046.5]

export class Sesler {
  private ctx: AudioContext | null = null
  private ana: GainNode | null = null
  private sessiz = readString(SESSIZ_ANAHTAR) === 'kapali'
  private uyandirmaBagli = false

  get kapali(): boolean {
    return this.sessiz
  }

  /** Sesi açar/kapatır ve tercihi saklar. Yeni durumu döner. */
  degistir(): boolean {
    this.sessiz = !this.sessiz
    writeString(SESSIZ_ANAHTAR, this.sessiz ? 'kapali' : 'acik')
    if (!this.sessiz) this.tik()
    return this.sessiz
  }

  // --- Oyun sesleri ---

  /** Kısa tık: yerleştirme, seçme, taş kaydırma. */
  tik(): void {
    this.ton({ frekans: 320, sure: 0.05, tip: 'square', ses: 0.16 })
  }

  /** 2048/15'li: kaydırma hışırtısı. */
  kaydir(): void {
    this.ton({ frekans: 300, bitisFrekans: 190, sure: 0.09, tip: 'sine', ses: 0.18 })
  }

  /** 2048: birleşme — kare büyüdükçe ton yükselir. */
  birlesme(deger: number): void {
    const basamak = Math.min(8, Math.log2(Math.max(2, deger)) - 1)
    const frekans = 300 * Math.pow(2, basamak / 5)
    this.ton({ frekans, bitisFrekans: frekans * 1.5, sure: 0.16, tip: 'triangle', ses: 0.26 })
  }

  /** Yılan: yem yeme — iki hızlı yükselen nota. */
  yem(): void {
    this.ton({ frekans: 620, sure: 0.06, tip: 'square', ses: 0.2 })
    this.ton({ frekans: 930, sure: 0.09, tip: 'square', ses: 0.2, gecikme: 0.06 })
  }

  /** Doğru harf / bulunan kelime. */
  dogru(): void {
    this.ton({ frekans: 520, sure: 0.08, tip: 'triangle', ses: 0.22 })
    this.ton({ frekans: 780, sure: 0.12, tip: 'triangle', ses: 0.22, gecikme: 0.08 })
  }

  /** Yanlış harf / hatalı rakam. */
  yanlis(): void {
    this.ton({ frekans: 220, bitisFrekans: 120, sure: 0.22, tip: 'sawtooth', ses: 0.16 })
  }

  /** Tetris: satır temizleme — temizlenen satır sayısı kadar nota. */
  satir(adet: number): void {
    for (let i = 0; i < Math.max(1, adet); i++) {
      this.ton({
        frekans: 440 * Math.pow(2, i / 4),
        sure: 0.1,
        tip: 'square',
        ses: 0.2,
        gecikme: i * 0.06,
      })
    }
  }

  /** Tetris: taşın yere oturması. */
  otur(): void {
    this.ton({ frekans: 150, bitisFrekans: 90, sure: 0.08, tip: 'triangle', ses: 0.2 })
  }

  /** Çarpma / oyun bitti. */
  carpma(): void {
    this.ton({ frekans: 260, bitisFrekans: 70, sure: 0.42, tip: 'sawtooth', ses: 0.24 })
  }

  /** Mayın patlaması: filtrelenmiş gürültü. */
  patlama(): void {
    const ctx = this.hazirla()
    if (!ctx || !this.ana) return

    const uzunluk = Math.floor(ctx.sampleRate * 0.45)
    const tampon = ctx.createBuffer(1, uzunluk, ctx.sampleRate)
    const veri = tampon.getChannelData(0)
    for (let i = 0; i < uzunluk; i++) {
      // Sönümlenen beyaz gürültü
      veri[i] = (Math.random() * 2 - 1) * (1 - i / uzunluk) ** 2
    }

    const kaynak = ctx.createBufferSource()
    kaynak.buffer = tampon

    const filtre = ctx.createBiquadFilter()
    filtre.type = 'lowpass'
    filtre.frequency.setValueAtTime(1200, ctx.currentTime)
    filtre.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.45)

    const kazanc = ctx.createGain()
    kazanc.gain.setValueAtTime(0.5, ctx.currentTime)

    kaynak.connect(filtre).connect(kazanc).connect(this.ana)
    kaynak.start()
    kaynak.stop(ctx.currentTime + 0.45)
  }

  /** Kazanma ezgisi. */
  zafer(): void {
    ZAFER_NOTALARI.forEach((frekans, i) => {
      this.ton({ frekans, sure: 0.16, tip: 'triangle', ses: 0.24, gecikme: i * 0.1 })
    })
  }

  // --- Alt yapı ---

  /**
   * Ses bağlamını kurar (ilk kullanımda) ve askıdaysa uyandırır.
   * Sessizken hiç bağlam açmıyoruz.
   */
  private hazirla(): AudioContext | null {
    if (this.sessiz) return null

    if (!this.ctx) {
      const Yapici = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Yapici) return null
      try {
        this.ctx = new Yapici()
      } catch {
        return null
      }
      this.ana = this.ctx.createGain()
      this.ana.gain.value = 0.9
      this.ana.connect(this.ctx.destination)
    }

    if (this.ctx.state === 'suspended') void this.ctx.resume()
    return this.ctx
  }

  private ton({ frekans, bitisFrekans, sure, tip = 'sine', ses = 0.2, gecikme = 0 }: TonAyari): void {
    const ctx = this.hazirla()
    if (!ctx || !this.ana) return

    const baslangic = ctx.currentTime + gecikme
    const osilator = ctx.createOscillator()
    osilator.type = tip
    osilator.frequency.setValueAtTime(frekans, baslangic)
    if (bitisFrekans) {
      osilator.frequency.exponentialRampToValueAtTime(Math.max(20, bitisFrekans), baslangic + sure)
    }

    // Kısa atak + üstel sönüm: tıkırtı olmadan yumuşak bir vuruş.
    const kazanc = ctx.createGain()
    kazanc.gain.setValueAtTime(0.0001, baslangic)
    kazanc.gain.exponentialRampToValueAtTime(ses, baslangic + 0.012)
    kazanc.gain.exponentialRampToValueAtTime(0.0001, baslangic + sure)

    osilator.connect(kazanc).connect(this.ana)
    osilator.start(baslangic)
    osilator.stop(baslangic + sure + 0.02)
  }

  /**
   * iOS ses bağlamını ilk kullanıcı hareketinde uyandırır.
   * Sayfa açılışında bir kez çağrılır.
   */
  ilkDokunustaUyandir(): void {
    if (this.uyandirmaBagli) return
    this.uyandirmaBagli = true

    const uyandir = (): void => {
      this.hazirla()
      document.removeEventListener('pointerdown', uyandir)
      document.removeEventListener('keydown', uyandir)
    }
    document.addEventListener('pointerdown', uyandir, { once: false })
    document.addEventListener('keydown', uyandir, { once: false })
  }
}

export const sesler = new Sesler()
