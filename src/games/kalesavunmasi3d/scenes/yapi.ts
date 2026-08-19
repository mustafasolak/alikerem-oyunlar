/**
 * Küçük geometri yardımcıları.
 *
 * Oyunda hazır model dosyası yok: kale de canavar da kutu, küre, silindir ve
 * koniden kuruluyor — iki boyutlu sürümün `Gorsel.parca()` mantığının üç
 * boyutlu karşılığı. Malzeme olarak Lambert seçildi: ışığa tepki verir ama
 * PBR'ın (Standard) maliyetini getirmez, telefonda rahat 60 kare döner.
 */

import * as THREE from 'three'

export interface MalzemeSecenek {
  saydam?: number
  /** Kendinden ışıyan yüzey (meşale, tepe ışığı). */
  isik?: number
  /** İki yüzü de çizilsin (bayrak gibi ince yüzeyler). */
  ciftYuz?: boolean
}

export function malzeme(renk: number, secenek: MalzemeSecenek = {}): THREE.MeshLambertMaterial {
  return new THREE.MeshLambertMaterial({
    color: renk,
    transparent: secenek.saydam !== undefined,
    opacity: secenek.saydam ?? 1,
    emissive: secenek.isik ?? 0x000000,
    side: secenek.ciftYuz ? THREE.DoubleSide : THREE.FrontSide,
  })
}

export function kutu(en: number, boy: number, derinlik: number, renk: number | THREE.Material): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.BoxGeometry(en, boy, derinlik),
    typeof renk === 'number' ? malzeme(renk) : renk,
  )
}

export function kure(yaricap: number, renk: number | THREE.Material, kalite = 12): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.SphereGeometry(yaricap, kalite, Math.max(6, kalite - 4)),
    typeof renk === 'number' ? malzeme(renk) : renk,
  )
}

export function silindir(
  ustR: number,
  altR: number,
  boy: number,
  renk: number | THREE.Material,
  kenar = 12,
): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.CylinderGeometry(ustR, altR, boy, kenar),
    typeof renk === 'number' ? malzeme(renk) : renk,
  )
}

export function koni(yaricap: number, boy: number, renk: number | THREE.Material, kenar = 10): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.ConeGeometry(yaricap, boy, kenar),
    typeof renk === 'number' ? malzeme(renk) : renk,
  )
}

/** Yere serilen düzlem (zemin, yol, bordür). XZ düzleminde yatar. */
export function doseme(en: number, derinlik: number, renk: number | THREE.Material): THREE.Mesh {
  const yuzey = new THREE.Mesh(
    new THREE.PlaneGeometry(en, derinlik),
    typeof renk === 'number' ? malzeme(renk) : renk,
  )
  yuzey.rotation.x = -Math.PI / 2
  return yuzey
}

/** Rengi bir miktar açar (0..1). */
export function acik(renk: number, oran: number): number {
  const c = new THREE.Color(renk)
  return c.lerp(new THREE.Color(0xffffff), oran).getHex()
}

/** Rengi bir miktar koyultur (0..1). */
export function koyu(renk: number, oran: number): number {
  const c = new THREE.Color(renk)
  return c.lerp(new THREE.Color(0x000000), oran).getHex()
}

/**
 * Gölge bayraklarını topluca verir.
 *
 * three.js'te gölge nesne nesne açılıyor: düşüren ve alan ayrı bayraklar.
 * Zemin yalnız alır, canavar ve yapılar hem düşürür hem alır.
 */
export function golgeVer(kok: THREE.Object3D, dusur: boolean, al: boolean): void {
  kok.traverse((nesne) => {
    if (!(nesne instanceof THREE.Mesh)) return
    nesne.castShadow = dusur
    nesne.receiveShadow = al
  })
}

/**
 * Sahneden çıkan nesnenin geometri ve malzemesini GPU'dan bırakır.
 *
 * Dokulara dokunmaz: hasar yazısı gibi paylaşılan dokular önbellekte durur,
 * onları `Efektler3D` topluca atar. Sprite geometrisi de atlanır — three.js
 * bütün sprite'lar için tek bir geometri paylaşıyor, atılırsa diğerleri kırılır.
 */
export function birak(kok: THREE.Object3D): void {
  kok.traverse((nesne) => {
    const mesh = nesne as Partial<THREE.Mesh>
    if (!(nesne instanceof THREE.Sprite)) mesh.geometry?.dispose()
    const malzemeler = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : []
    for (const m of malzemeler) m.dispose()
  })
}

/** Bir nesnenin (ve altındakilerin) rengini toptan değiştirir. */
export function renkVer(nesne: THREE.Object3D, renk: number): void {
  const mesh = nesne as Partial<THREE.Mesh>
  const malzemeler = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : []
  for (const m of malzemeler) {
    if ('color' in m) (m as THREE.MeshLambertMaterial).color.setHex(renk)
  }
}
