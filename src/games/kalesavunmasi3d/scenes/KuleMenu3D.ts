/**
 * Yuvaya dokununca kulenin üstünde açılan menü.
 *
 * Sayfanın altındaki panele inmeden, kulenin başında seçim yapılabilsin diye
 * var. Menü dünyada duruyor (yuvanın üstünde) ama **ekranda sabit büyüklükte**:
 * her karede kameraya olan uzaklığa göre ölçekleniyor, böylece uzaktaki kulenin
 * menüsü de yakındakinin menüsü kadar okunur oluyor.
 *
 * Yazı bir tuvale çiziliyor, dokunuş da o tuvalin dokusundaki satıra göre
 * çözülüyor: ışın menüye çarpınca gelen `uv` değeri hangi satıra denk geldiğini
 * söylüyor. Böylece oyun klasörüne HTML/CSS girmiyor.
 */

import * as THREE from 'three'

import { FONT_FAMILY, KULE_TIPLERI } from '../../kalesavunmasi/config/constants.ts'
import type { Kule } from '../../kalesavunmasi/systems/KaleSavunmasi.ts'

export type MenuEylem = 'kule0' | 'kule1' | 'kule2' | 'yukselt' | 'hedef' | 'yik'

export interface MenuDurum {
  yuva: number
  kule: Kule | null
  altin: number
  /** Kule varsa yıkım bedeli. */
  yikimBedeli: number | null
  /** Kule varsa sıradaki seviyenin fiyatı; tavandaysa null. */
  yukseltmeFiyati: number | null
  hedeflemeAdi: string
  hedeflemeSimgesi: string
}

const TUVAL_EN = 512
const TUVAL_BOY = 400
/** Başlık şeridinin tuvaldeki payı. */
const BASLIK_ORANI = 0.22
/** Menü ekranın kaçta kaçını kaplasın (yükseklik). */
const EKRAN_ORANI = 0.33
/** Satır sayısı — üç seçenek. */
const SATIR = 3

interface Satir {
  simge: string
  ad: string
  deger: string
  /** Tıklanabilir mi? */
  acik: boolean
  /** Sağdaki değer altın mı (sarı) yoksa düz yazı mı? */
  altin: boolean
}

export class KuleMenu3D {
  /** Işın izleme hedefi. */
  readonly nesne: THREE.Mesh

  private readonly tuval: HTMLCanvasElement
  private readonly doku: THREE.CanvasTexture
  private readonly konum = new THREE.Vector3()
  private satirlar: Satir[] = []
  private durumImzasi = ''

  constructor(sahne: THREE.Scene) {
    this.tuval = document.createElement('canvas')
    this.tuval.width = TUVAL_EN
    this.tuval.height = TUVAL_BOY
    this.doku = new THREE.CanvasTexture(this.tuval)

    this.nesne = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      // Işıktan etkilenmesin ve her şeyin önünde dursun: bu bir arayüz.
      new THREE.MeshBasicMaterial({ map: this.doku, transparent: true, depthTest: false, depthWrite: false }),
    )
    this.nesne.renderOrder = 20
    this.nesne.visible = false
    sahne.add(this.nesne)
  }

  get acik(): boolean {
    return this.nesne.visible
  }

  /**
   * Menüyü açar. Zaten açıksa yeri değişmez: kule kurulunca/yükselince menü
   * yukarı kayarsa aynı yere ikinci kez dokunan oyuncu başka satıra basıyor.
   */
  ac(konum: THREE.Vector3, durum: MenuDurum): void {
    if (!this.nesne.visible) this.konum.copy(konum)
    this.nesne.visible = true
    this.durumImzasi = ''
    this.tazele(durum)
  }

  kapat(): void {
    this.nesne.visible = false
  }

  /** Durum değiştiyse tuvali yeniden çizer (altın değişince fiyatlar sönebilir). */
  tazele(durum: MenuDurum): void {
    const imza = `${durum.yuva}|${durum.kule?.tip ?? -1}.${durum.kule?.seviye ?? 0}|${durum.altin}|${durum.hedeflemeAdi}|${durum.yukseltmeFiyati}|${durum.yikimBedeli}`
    if (imza === this.durumImzasi) return
    this.durumImzasi = imza
    this.satirlar = durum.kule ? this.doluSatirlar(durum) : this.bosSatirlar(durum)
    this.ciz(durum)
  }

  /** Her karede: kameraya dön ve ekranda sabit büyüklükte kal. */
  guncelle(kamera: THREE.PerspectiveCamera): void {
    if (!this.nesne.visible) return
    this.nesne.position.copy(this.konum)
    this.nesne.quaternion.copy(kamera.quaternion)
    const uzaklik = kamera.position.distanceTo(this.konum)
    const boy = EKRAN_ORANI * 2 * uzaklik * Math.tan((kamera.fov * Math.PI) / 360)
    this.nesne.scale.set((boy * TUVAL_EN) / TUVAL_BOY, boy, 1)
  }

  /** Dokunulan noktanın hangi satıra denk geldiği. */
  eylem(uv: THREE.Vector2, kuleVarMi: boolean): MenuEylem | null {
    const ust = 1 - uv.y
    if (ust < BASLIK_ORANI) return null
    const sira = Math.floor(((ust - BASLIK_ORANI) / (1 - BASLIK_ORANI)) * SATIR)
    if (sira < 0 || sira >= SATIR) return null
    if (!this.satirlar[sira]?.acik) return null
    if (kuleVarMi) return (['yukselt', 'hedef', 'yik'] as const)[sira]
    return (['kule0', 'kule1', 'kule2'] as const)[sira]
  }

  bosalt(): void {
    this.doku.dispose()
    this.nesne.geometry.dispose()
    ;(this.nesne.material as THREE.Material).dispose()
    this.nesne.removeFromParent()
  }

  // --- İçerik ---

  private bosSatirlar(durum: MenuDurum): Satir[] {
    const simgeler = ['🏹', '💣', '🔮']
    return KULE_TIPLERI.map((tip, i) => ({
      simge: simgeler[i] ?? '🏰',
      ad: tip.ad.replace(' Kulesi', ''),
      deger: String(tip.fiyat[0]),
      acik: durum.altin >= tip.fiyat[0],
      altin: true,
    }))
  }

  private doluSatirlar(durum: MenuDurum): Satir[] {
    const fiyat = durum.yukseltmeFiyati
    return [
      {
        simge: '⬆',
        ad: 'Yükselt',
        deger: fiyat === null ? 'tam' : String(fiyat),
        acik: fiyat !== null && durum.altin >= fiyat,
        altin: fiyat !== null,
      },
      { simge: durum.hedeflemeSimgesi, ad: 'Hedef', deger: durum.hedeflemeAdi, acik: true, altin: false },
      {
        simge: '⛏',
        ad: 'Yık',
        deger: durum.yikimBedeli === null ? '—' : `+${durum.yikimBedeli}`,
        acik: durum.yikimBedeli !== null,
        altin: true,
      },
    ]
  }

  // --- Çizim ---

  private ciz(durum: MenuDurum): void {
    const ctx = this.tuval.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, TUVAL_EN, TUVAL_BOY)

    // Gövde
    this.kutuCiz(ctx, 6, 6, TUVAL_EN - 12, TUVAL_BOY - 12, 22, 'rgba(15,23,42,0.92)', 'rgba(148,163,184,0.9)')

    const baslikBoy = TUVAL_BOY * BASLIK_ORANI
    ctx.fillStyle = '#e2e8f0'
    ctx.font = `bold 40px ${FONT_FAMILY}`
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'
    const baslik = durum.kule
      ? `${KULE_TIPLERI[durum.kule.tip].ad.replace(' Kulesi', '')} · Lv${durum.kule.seviye}`
      : `Yuva ${durum.yuva + 1}`
    ctx.fillText(baslik, 30, baslikBoy / 2 + 6)

    ctx.textAlign = 'right'
    ctx.fillStyle = '#fbbf24'
    ctx.font = `bold 34px ${FONT_FAMILY}`
    ctx.fillText(`${durum.altin} 🪙`, TUVAL_EN - 30, baslikBoy / 2 + 6)

    // Satırlar
    const satirBoy = (TUVAL_BOY - baslikBoy - 16) / SATIR
    for (let i = 0; i < this.satirlar.length; i++) {
      const s = this.satirlar[i]
      const y = baslikBoy + i * satirBoy + 4
      this.kutuCiz(
        ctx,
        18,
        y,
        TUVAL_EN - 36,
        satirBoy - 10,
        14,
        s.acik ? 'rgba(51,65,85,0.95)' : 'rgba(30,41,59,0.75)',
        s.acik ? 'rgba(148,163,184,0.7)' : 'rgba(71,85,105,0.5)',
      )
      const orta = y + (satirBoy - 10) / 2
      ctx.textAlign = 'left'
      ctx.font = `36px ${FONT_FAMILY}`
      ctx.fillStyle = s.acik ? '#f8fafc' : '#64748b'
      ctx.fillText(s.simge, 36, orta)
      ctx.font = `bold 34px ${FONT_FAMILY}`
      ctx.fillText(s.ad, 92, orta)
      ctx.textAlign = 'right'
      ctx.fillStyle = s.acik ? (s.altin ? '#fbbf24' : '#93c5fd') : '#64748b'
      ctx.fillText(s.deger, TUVAL_EN - 40, orta)
    }
    this.doku.needsUpdate = true
  }

  private kutuCiz(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    en: number,
    boy: number,
    yaricap: number,
    dolgu: string,
    kenar: string,
  ): void {
    ctx.beginPath()
    ctx.roundRect(x, y, en, boy, yaricap)
    ctx.fillStyle = dolgu
    ctx.fill()
    ctx.lineWidth = 3
    ctx.strokeStyle = kenar
    ctx.stroke()
  }
}
