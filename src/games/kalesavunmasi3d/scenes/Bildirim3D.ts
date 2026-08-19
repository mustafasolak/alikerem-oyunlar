/**
 * Ekranın üstünde beliren kısa duyuru ("Dalga 3", "Kule kuruldu").
 *
 * Kameranın çocuğu olarak duruyor: dünyada bir yeri yok, hep aynı noktada
 * görünüyor. Yazı tek bir tuvale çizilip dokusu tazeleniyor — her duyuruda yeni
 * doku üretilmiyor.
 */

import * as THREE from 'three'

import { FONT_FAMILY } from '../../kalesavunmasi/config/constants.ts'

const TUVAL_EN = 768
const TUVAL_BOY = 128
/** Kameradan uzaklığı ve ekrandaki yeri (kamera birimi). */
const UZAKLIK = 1
const YUKARI = 0.3
const GENISLIK = 1
/** Tam görünür kaldığı süre ve sönme süresi (ms). */
const BEKLE_MS = 950
const SONME_MS = 420

export class Bildirim3D {
  private readonly tuval: HTMLCanvasElement
  private readonly doku: THREE.CanvasTexture
  private readonly sprite: THREE.Sprite
  private kalan = 0

  constructor(kamera: THREE.Camera) {
    this.tuval = document.createElement('canvas')
    this.tuval.width = TUVAL_EN
    this.tuval.height = TUVAL_BOY
    this.doku = new THREE.CanvasTexture(this.tuval)

    this.sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: this.doku, transparent: true, depthTest: false, opacity: 0 }),
    )
    this.sprite.scale.set(GENISLIK, (GENISLIK * TUVAL_BOY) / TUVAL_EN, 1)
    this.sprite.position.set(0, YUKARI, -UZAKLIK)
    this.sprite.renderOrder = 10
    kamera.add(this.sprite)
  }

  yaz(metin: string): void {
    const ctx = this.tuval.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, TUVAL_EN, TUVAL_BOY)
    ctx.font = `bold 56px ${FONT_FAMILY}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.lineWidth = 10
    ctx.strokeStyle = 'rgba(15,23,42,0.85)'
    ctx.strokeText(metin, TUVAL_EN / 2, TUVAL_BOY / 2)
    ctx.fillStyle = '#f8fafc'
    ctx.fillText(metin, TUVAL_EN / 2, TUVAL_BOY / 2)
    this.doku.needsUpdate = true
    this.kalan = BEKLE_MS + SONME_MS
    this.sprite.material.opacity = 1
  }

  guncelle(delta: number): void {
    if (this.kalan <= 0) return
    this.kalan -= delta
    this.sprite.material.opacity = Math.max(0, Math.min(1, this.kalan / SONME_MS))
  }

  temizle(): void {
    this.kalan = 0
    this.sprite.material.opacity = 0
  }
}
