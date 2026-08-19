/**
 * Üç boyutlu oyunların sahne iskeleti — `TemelSahne`nin Phaser'sız ikizi.
 *
 * Neden ayrı: Phaser 4'te 3D çizim yok (yalnız `Mesh2D`). Üç boyutlu oyunlar
 * three.js ile kendi tuvalini kurar. Buna karşılık sayfanın geri kalanı hiç
 * değişmez: HUD, skor tablosu, süre sayacı, ses düğmesi ve sonuç katmanı aynı
 * ortak modüllerden gelir; hiçbiri Phaser'a bağlı değil.
 *
 * Sahne sınıfları bundan türeyip `kur()`, `yeniOyun()` ve `guncelle(delta)`
 * verir. Kabuk (`OyunSayfasi`) yalnız `baslat()` ve `yikil()` çağırır.
 */

import * as THREE from 'three'

import type { UcBoyutSahnesi } from '../cekirdek/tanim.ts'
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

/**
 * Bir karede geçtiği kabul edilen azami süre.
 * Sekme arka planda kalınca iki kare arası saniyelere çıkar; kırpmazsak oyun
 * geri dönüldüğü anda fırlar.
 */
const MAX_DELTA = 50
/** Retina ekranda dört kat piksel doldurmak telefonda pahalı; ikide duruyoruz. */
const MAX_PIKSEL_ORANI = 2
/** Süre rozetinin tazelenme aralığı (ms). */
const SURE_ARALIGI = 250

/** Sahne yıkılırken GPU'daki geometri, malzeme ve dokuları bırakır. */
function kaynaklariBirak(kok: THREE.Object3D): void {
  kok.traverse((nesne) => {
    const mesh = nesne as Partial<THREE.Mesh>
    // Sprite geometrisi three.js içinde tekil ve paylaşımlı: atılırsa sonraki
    // sahnedeki bütün sprite'lar kırılır.
    if (!(nesne instanceof THREE.Sprite)) mesh.geometry?.dispose()
    const malzeme = mesh.material
    for (const m of Array.isArray(malzeme) ? malzeme : malzeme ? [malzeme] : []) {
      for (const deger of Object.values(m)) {
        if (deger instanceof THREE.Texture) deger.dispose()
      }
      m.dispose()
    }
  })
}

export abstract class UcBoyutSahne implements UcBoyutSahnesi {
  protected hud!: GameHud
  protected recorder!: ScoreRecorder
  protected readonly sayac = new Sayac()

  /** Oyun bitti mi? Girdi işleyicileri bunu kontrol etmeli. */
  protected bitti = false
  /** Katmanda ad yazılıyor mu? Klavye oyuna gitmemeli. */
  protected yaziyor = false

  protected sahne!: THREE.Scene
  protected kamera!: THREE.PerspectiveCamera
  protected cizici!: THREE.WebGLRenderer
  /** Tuvalin oturduğu kutu; dokunuş koordinatları buna göre çözülür. */
  protected kap!: HTMLElement

  private readonly oyunId: string
  private cerceve = 0
  private sonZaman = 0
  private olcuGozcusu?: ResizeObserver
  private sureSayaci = 0
  private readonly zamanlayicilar = new Set<number>()
  private readonly temizleyiciler: (() => void)[] = []
  private readonly tusIsleyiciler = new Map<string, (() => void)[]>()
  private readonly yakalananTuslar = new Set<string>()

  constructor(oyunId: string) {
    this.oyunId = oyunId
  }

  /** Dünya nesnelerini kurar, girdiyi bağlar. Bir kez çağrılır. */
  protected abstract kur(): void

  /** Yeni tur: durumu sıfırlar. */
  protected abstract yeniOyun(): void

  /** Her kare: `delta` milisaniye. Çizim bundan sonra yapılır. */
  protected abstract guncelle(delta: number): void

  // --- Yaşam döngüsü ---

  baslat(kap: HTMLElement): void {
    this.kap = kap
    this.sahne = new THREE.Scene()
    this.kamera = new THREE.PerspectiveCamera(50, this.oran(), 1, 4000)
    this.cizici = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    this.cizici.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIKSEL_ORANI))
    // CSS tuvali kabına oturtur; ölçüyü ResizeObserver veriyor.
    this.cizici.domElement.style.width = '100%'
    this.cizici.domElement.style.height = '100%'
    kap.appendChild(this.cizici.domElement)
    this.olculeriTazele()

    this.kur()

    this.hud = new GameHud({ onRestart: () => this.yenidenBasla() })
    this.hud.setScore(0)
    this.recorder = new ScoreRecorder(this.oyunId, this.hud, (typing) => this.yazmaModu(typing))

    window.addEventListener('keydown', this.tusBasildi)
    this.olcuGozcusu = new ResizeObserver(() => this.olculeriTazele())
    this.olcuGozcusu.observe(kap)
    this.sureSayaci = window.setInterval(() => this.sureyiTazele(), SURE_ARALIGI)

    this.yeniOyun()
    this.sonZaman = performance.now()
    this.cerceve = requestAnimationFrame(this.dongu)
  }

  yikil(): void {
    cancelAnimationFrame(this.cerceve)
    window.clearInterval(this.sureSayaci)
    for (const kimlik of this.zamanlayicilar) window.clearTimeout(kimlik)
    this.zamanlayicilar.clear()
    window.removeEventListener('keydown', this.tusBasildi)
    this.olcuGozcusu?.disconnect()
    for (const temizle of this.temizleyiciler) temizle()
    this.temizleyiciler.length = 0
    this.tusIsleyiciler.clear()

    kaynaklariBirak(this.sahne)
    this.sahne.clear()
    // Bağlamı açıkça bırak: tarayıcı aynı anda sınırlı sayıda WebGL bağlamı
    // tutuyor, oyunlar arasında gezinen oyuncuda birikmesin.
    this.cizici.forceContextLoss()
    this.cizici.dispose()
    this.cizici.domElement.remove()
  }

  private readonly dongu = (zaman: number): void => {
    this.cerceve = requestAnimationFrame(this.dongu)
    const delta = Math.min(MAX_DELTA, zaman - this.sonZaman)
    this.sonZaman = zaman
    if (delta > 0) this.guncelle(delta)
    this.cizici.render(this.sahne, this.kamera)
  }

  private oran(): number {
    const en = this.kap?.clientWidth || 1
    const boy = this.kap?.clientHeight || 1
    return en / boy
  }

  private olculeriTazele(): void {
    const en = this.kap.clientWidth
    const boy = this.kap.clientHeight
    if (en === 0 || boy === 0) return
    this.cizici.setSize(en, boy, false)
    this.kamera.aspect = en / boy
    this.kamera.updateProjectionMatrix()
    this.olculerDegisti()
  }

  /** Tuval ölçüsü değişti; kamerasını sahaya göre oturtan oyunlar burayı ezer. */
  protected olculerDegisti(): void {}

  // --- Girdi ---

  /**
   * Bir klavye tuşuna işleyici bağlar. Kod `KeyboardEvent.code` biçimindedir:
   * 'Space', 'ArrowUp', 'KeyE'.
   */
  protected tus(kod: string | string[], isle: () => void): void {
    for (const k of Array.isArray(kod) ? kod : [kod]) {
      const liste = this.tusIsleyiciler.get(k) ?? []
      liste.push(isle)
      this.tusIsleyiciler.set(k, liste)
    }
  }

  /** Sayfayı kaydırmasın diye tarayıcıdan alınacak tuşlar. */
  protected tuslariYakala(kodlar: string[]): void {
    for (const kod of kodlar) this.yakalananTuslar.add(kod)
  }

  private readonly tusBasildi = (olay: KeyboardEvent): void => {
    if (this.yaziyor) return
    const isleyiciler = this.tusIsleyiciler.get(olay.code)
    if (!isleyiciler?.length) return
    if (this.yakalananTuslar.has(olay.code)) olay.preventDefault()
    for (const isle of isleyiciler) isle()
  }

  /** Sayfadaki tuş takımı düğmesini bağlar (`arayuz.pad` bildirimindeki değer). */
  protected padDugmesi(deger: string, isle: () => void): HTMLButtonElement | null {
    const dugme = document.querySelector<HTMLButtonElement>(`#pad button[data-move="${deger}"]`)
    if (!dugme) return null
    const tikla = (): void => isle()
    dugme.addEventListener('click', tikla)
    this.temizleyiciler.push(() => dugme.removeEventListener('click', tikla))
    return dugme
  }

  /** Tuvale gelen dokunuşu bağlar; koordinat -1..1 aralığında (three.js kuralı). */
  protected tuvalOlayi(
    tur: 'pointerdown' | 'pointermove' | 'pointerup' | 'pointerleave' | 'pointercancel',
    isle: (x: number, y: number) => void,
  ): void {
    const tuval = this.cizici.domElement
    const olayIsle = (olay: PointerEvent): void => {
      const kutu = tuval.getBoundingClientRect()
      isle(((olay.clientX - kutu.left) / kutu.width) * 2 - 1, -((olay.clientY - kutu.top) / kutu.height) * 2 + 1)
    }
    tuval.addEventListener(tur, olayIsle)
    this.temizleyiciler.push(() => tuval.removeEventListener(tur, olayIsle))
  }

  /** Ad yazarken oyun tuşları devre dışı kalsın. */
  protected yazmaModu(typing: boolean): void {
    this.yaziyor = typing
  }

  // --- Tur akışı ---

  protected skorGoster(skor: number): void {
    this.hud.setScore(skor)
  }

  protected sureyiTazele(): void {
    if (!this.bitti) setChip('timer', this.sayac.yazi)
  }

  /** Yıkılırken iptal edilen setTimeout. */
  protected gecikmeli(ms: number, isle: () => void): void {
    const kimlik = window.setTimeout(() => {
      this.zamanlayicilar.delete(kimlik)
      isle()
    }, ms)
    this.zamanlayicilar.add(kimlik)
  }

  protected yenidenBasla(): void {
    this.hud.hideOverlay()
    for (const kimlik of this.zamanlayicilar) window.clearTimeout(kimlik)
    this.zamanlayicilar.clear()
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

    this.gecikmeli(ayar.gecikme ?? 340, () => {
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
