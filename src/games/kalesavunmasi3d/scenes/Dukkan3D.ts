/**
 * Oyun içi dükkân: sağ üstteki ☰ düğmesi ve açılan yükseltme menüsü.
 *
 * Sayfanın altındaki panele inmeden, tuvalin üstünden alışveriş yapılabilsin
 * diye var. Menü açıkken oyun duraklıyor (sahne bunu yönetiyor), kapanınca
 * kaldığı yerden sürüyor.
 *
 * Hem düğme hem menü kameranın çocuğu: dünyada bir yerleri yok, ekranda sabit
 * duruyorlar. Dokunuş, tuvale çizilen ızgaradaki hücreye göre çözülüyor —
 * ışının verdiği `uv` hangi satır ve sütuna denk geldiğini söylüyor.
 */

import * as THREE from 'three'

import { FONT_FAMILY } from '../../kalesavunmasi/config/constants.ts'

export interface DukkanSatiri {
  id: string
  etiket: string
  ozet: string
  seviye: number
  maxSeviye: number
  /** Sıradaki seviyenin fiyatı; tavan dolduysa null. */
  fiyat: number | null
  alinabilir: boolean
}

export type DukkanEylem = { tur: 'kapat' } | { tur: 'al'; id: string }

const PANEL_EN = 1200
const PANEL_BOY = 620
const DUGME_OLCU = 160
/** Kameradan uzaklık — yakın düzlem 1 birimde, orada duran yüzey kırpılıyor. */
const UZAKLIK = 2
/** Menünün ekranda kapladığı en büyük oran. */
const PANEL_ORANI = 0.94
/** Düğmenin ekran yüksekliğine oranı ve kenar payı. */
const DUGME_ORANI = 0.14
const KENAR_PAYI = 0.03
/** Izgara: iki sütun, beş satır. */
const SUTUN = 2
const SATIR = 5
/** Başlık şeridinin paneldeki payı. */
const BASLIK_ORANI = 80 / PANEL_BOY

function tuvalKur(en: number, boy: number): [HTMLCanvasElement, THREE.CanvasTexture] {
  const tuval = document.createElement('canvas')
  tuval.width = en
  tuval.height = boy
  return [tuval, new THREE.CanvasTexture(tuval)]
}

function yuzeyKur(doku: THREE.CanvasTexture, sira: number): THREE.Mesh {
  const yuzey = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ map: doku, transparent: true, depthTest: false, depthWrite: false }),
  )
  yuzey.renderOrder = sira
  return yuzey
}

function kutuCiz(
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

export class Dukkan3D {
  readonly dugme: THREE.Mesh
  readonly panel: THREE.Mesh

  private readonly panelTuval: HTMLCanvasElement
  private readonly panelDoku: THREE.CanvasTexture
  private readonly dugmeDoku: THREE.CanvasTexture
  private satirlar: DukkanSatiri[] = []
  private imza = ''

  constructor(kamera: THREE.Camera) {
    const [panelTuval, panelDoku] = tuvalKur(PANEL_EN, PANEL_BOY)
    this.panelTuval = panelTuval
    this.panelDoku = panelDoku
    this.panel = yuzeyKur(panelDoku, 30)
    this.panel.visible = false

    const [dugmeTuval, dugmeDoku] = tuvalKur(DUGME_OLCU, DUGME_OLCU)
    this.dugmeDoku = dugmeDoku
    this.dugme = yuzeyKur(dugmeDoku, 28)
    this.dugmeyiCiz(dugmeTuval)

    kamera.add(this.dugme, this.panel)
  }

  get acik(): boolean {
    return this.panel.visible
  }

  ac(): void {
    this.panel.visible = true
    this.imza = ''
  }

  kapat(): void {
    this.panel.visible = false
  }

  /** İçerik değişmedikçe tuval yeniden çizilmez. */
  tazele(satirlar: DukkanSatiri[], altin: number): void {
    if (!this.panel.visible) return
    const imza = `${altin}|${satirlar.map((s) => `${s.id}${s.seviye}${s.fiyat}${s.alinabilir}`).join(',')}`
    if (imza === this.imza) return
    this.imza = imza
    this.satirlar = satirlar
    this.ciz(altin)
  }

  /** Ekran oranı değişse de düğme köşede, menü ortada ve sığmış kalsın. */
  yerlestir(kamera: THREE.PerspectiveCamera): void {
    const boy = 2 * UZAKLIK * Math.tan((kamera.fov * Math.PI) / 360)
    const en = boy * kamera.aspect

    const dugmeBoy = boy * DUGME_ORANI
    this.dugme.scale.set(dugmeBoy, dugmeBoy, 1)
    this.dugme.position.set(en / 2 - dugmeBoy / 2 - boy * KENAR_PAYI, boy / 2 - dugmeBoy / 2 - boy * KENAR_PAYI, -UZAKLIK)

    const oran = PANEL_EN / PANEL_BOY
    const panelBoy = Math.min(boy * PANEL_ORANI, (en * PANEL_ORANI) / oran)
    this.panel.scale.set(panelBoy * oran, panelBoy, 1)
    this.panel.position.set(0, 0, -UZAKLIK)
  }

  /** Dokunulan hücrenin karşılığı. */
  eylem(uv: THREE.Vector2): DukkanEylem | null {
    const ust = 1 - uv.y
    if (ust < BASLIK_ORANI) return uv.x > 0.93 ? { tur: 'kapat' } : null
    const satir = Math.floor(((ust - BASLIK_ORANI) / (1 - BASLIK_ORANI)) * SATIR)
    const sutun = uv.x < 0.5 ? 0 : 1
    const sira = satir * SUTUN + sutun
    const secilen = this.satirlar[sira]
    if (!secilen || !secilen.alinabilir) return null
    return { tur: 'al', id: secilen.id }
  }

  bosalt(): void {
    for (const yuzey of [this.dugme, this.panel]) {
      yuzey.geometry.dispose()
      ;(yuzey.material as THREE.Material).dispose()
      yuzey.removeFromParent()
    }
    this.panelDoku.dispose()
    this.dugmeDoku.dispose()
  }

  // --- Çizim ---

  private dugmeyiCiz(tuval: HTMLCanvasElement): void {
    const ctx = tuval.getContext('2d')
    if (!ctx) return
    kutuCiz(ctx, 6, 6, DUGME_OLCU - 12, DUGME_OLCU - 12, 30, 'rgba(15,23,42,0.88)', 'rgba(148,163,184,0.9)')
    ctx.fillStyle = '#f8fafc'
    ctx.font = `bold 84px ${FONT_FAMILY}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('☰', DUGME_OLCU / 2, DUGME_OLCU / 2 + 4)
    this.dugmeDoku.needsUpdate = true
  }

  private ciz(altin: number): void {
    const ctx = this.panelTuval.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, PANEL_EN, PANEL_BOY)
    kutuCiz(ctx, 4, 4, PANEL_EN - 8, PANEL_BOY - 8, 26, 'rgba(15,23,42,0.94)', 'rgba(148,163,184,0.9)')

    const baslikBoy = PANEL_BOY * BASLIK_ORANI
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'
    ctx.fillStyle = '#e2e8f0'
    ctx.font = `bold 42px ${FONT_FAMILY}`
    ctx.fillText('Yükseltme dükkânı', 32, baslikBoy / 2 + 4)
    ctx.textAlign = 'right'
    ctx.fillStyle = '#fbbf24'
    ctx.font = `bold 38px ${FONT_FAMILY}`
    ctx.fillText(`${altin} 🪙`, PANEL_EN - 130, baslikBoy / 2 + 4)
    // Kapatma
    kutuCiz(ctx, PANEL_EN - 96, 14, 82, baslikBoy - 22, 16, 'rgba(51,65,85,0.95)', 'rgba(148,163,184,0.7)')
    ctx.fillStyle = '#f8fafc'
    ctx.textAlign = 'center'
    ctx.font = `bold 38px ${FONT_FAMILY}`
    ctx.fillText('✕', PANEL_EN - 55, baslikBoy / 2 + 2)

    const alanBoy = PANEL_BOY - baslikBoy - 14
    const hucreEn = (PANEL_EN - 40) / SUTUN
    const hucreBoy = alanBoy / SATIR
    for (let i = 0; i < this.satirlar.length && i < SUTUN * SATIR; i++) {
      const s = this.satirlar[i]
      const sutun = i % SUTUN
      const satir = Math.floor(i / SUTUN)
      const x = 20 + sutun * hucreEn
      const y = baslikBoy + satir * hucreBoy
      kutuCiz(
        ctx,
        x + 6,
        y + 5,
        hucreEn - 12,
        hucreBoy - 10,
        14,
        s.alinabilir ? 'rgba(51,65,85,0.95)' : 'rgba(30,41,59,0.8)',
        s.alinabilir ? 'rgba(148,163,184,0.75)' : 'rgba(71,85,105,0.5)',
      )
      const yazi = s.alinabilir ? '#f8fafc' : '#64748b'
      ctx.textAlign = 'left'
      ctx.fillStyle = yazi
      ctx.font = `bold 32px ${FONT_FAMILY}`
      ctx.fillText(s.etiket, x + 26, y + hucreBoy * 0.36)
      ctx.fillStyle = s.alinabilir ? '#94a3b8' : '#475569'
      ctx.font = `24px ${FONT_FAMILY}`
      ctx.fillText(s.ozet, x + 26, y + hucreBoy * 0.7)

      ctx.textAlign = 'right'
      ctx.fillStyle = s.fiyat === null ? '#64748b' : s.alinabilir ? '#fbbf24' : '#7c6a3a'
      ctx.font = `bold 34px ${FONT_FAMILY}`
      ctx.fillText(s.fiyat === null ? (s.maxSeviye === 1 ? 'alındı' : 'tam') : String(s.fiyat), x + hucreEn - 26, y + hucreBoy * 0.36)
      if (s.maxSeviye > 1) {
        ctx.fillStyle = s.alinabilir ? '#93c5fd' : '#475569'
        ctx.font = `24px ${FONT_FAMILY}`
        ctx.fillText(`Lv${s.seviye}/${s.maxSeviye}`, x + hucreEn - 26, y + hucreBoy * 0.7)
      }
    }
    this.panelDoku.needsUpdate = true
  }
}
