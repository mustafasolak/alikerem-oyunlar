/**
 * Dalga arasında ekranın köşesinde duran önizleme.
 *
 * "Ne geliyor, ne kadar zamanım var" sorusunu oyun durmadan yanıtlıyor:
 * sıradaki dalganın numarası, canavar sayısı, şef gelip gelmediği, o dalgada
 * ilk kez çıkacak tipler ve geri sayım. Kameranın çocuğu olduğu için dünyada
 * bir yeri yok, hep aynı köşede duruyor.
 */

import * as THREE from 'three'

import { FONT_FAMILY } from '../../kalesavunmasi/config/constants.ts'

const TUVAL_EN = 512
const TUVAL_BOY = 192
/**
 * Ekrandaki yeri ve genişliği (kamera birimi).
 *
 * Uzaklık bilerek 1 değil: kameranın yakın düzlemi 1 birimde ve tam orada duran
 * yüzey kırpılıp hiç görünmüyordu. İki birim öteye alıp ölçüyü de iki katına
 * çıkarınca ekranda kapladığı yer aynı kalıyor, kırpılma bitiyor.
 */
const UZAKLIK = 2
const SOL = -0.52
const YUKARI = 0.3
const GENISLIK = 0.62

export class Onizleme3D {
  private readonly tuval: HTMLCanvasElement
  private readonly doku: THREE.CanvasTexture
  private readonly sprite: THREE.Sprite
  private imza = ''

  constructor(kamera: THREE.Camera) {
    this.tuval = document.createElement('canvas')
    this.tuval.width = TUVAL_EN
    this.tuval.height = TUVAL_BOY
    this.doku = new THREE.CanvasTexture(this.tuval)
    this.sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: this.doku, transparent: true, depthTest: false, opacity: 0 }),
    )
    this.sprite.scale.set(GENISLIK * UZAKLIK, (GENISLIK * UZAKLIK * TUVAL_BOY) / TUVAL_EN, 1)
    this.sprite.position.set(SOL * UZAKLIK, YUKARI * UZAKLIK, -UZAKLIK)
    this.sprite.renderOrder = 9
    kamera.add(this.sprite)
  }

  /** Metin null ise gizlenir. İçerik değişmedikçe tuval yeniden çizilmez. */
  goster(baslik: string | null, alt: string): void {
    if (baslik === null) {
      this.sprite.material.opacity = 0
      this.imza = ''
      return
    }
    this.sprite.material.opacity = 1
    const imza = `${baslik}|${alt}`
    if (imza === this.imza) return
    this.imza = imza
    this.ciz(baslik, alt)
  }

  gizle(): void {
    this.goster(null, '')
  }

  private ciz(baslik: string, alt: string): void {
    const ctx = this.tuval.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, TUVAL_EN, TUVAL_BOY)
    ctx.beginPath()
    ctx.roundRect(4, 4, TUVAL_EN - 8, TUVAL_BOY - 8, 18)
    ctx.fillStyle = 'rgba(15,23,42,0.82)'
    ctx.fill()
    ctx.lineWidth = 3
    ctx.strokeStyle = 'rgba(148,163,184,0.75)'
    ctx.stroke()

    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#f8fafc'
    ctx.font = `bold 40px ${FONT_FAMILY}`
    ctx.fillText(baslik, 26, TUVAL_BOY * 0.34)
    ctx.fillStyle = '#93c5fd'
    ctx.font = `32px ${FONT_FAMILY}`
    ctx.fillText(alt, 26, TUVAL_BOY * 0.7)
    this.doku.needsUpdate = true
  }
}
