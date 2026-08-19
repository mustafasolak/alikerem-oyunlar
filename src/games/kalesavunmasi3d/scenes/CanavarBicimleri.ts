/**
 * Canavar siluetleri.
 *
 * Bütün tipler aynı gövdeden türüyordu, yalnız rengi ve boyu değişiyordu;
 * uzaktan hangisinin geldiği anlaşılmıyordu. Artık her tip kendi silueti ile
 * geliyor ve biçim, paylaşılan canavar tablosundaki alanlardan seçiliyor —
 * yani `constants.ts`'e yeni alan eklemeye gerek yok, iki boyutlu sürüm
 * etkilenmiyor:
 *
 *   patron   → Şef: boynuz, taç, pelerin, topuz
 *   ucar     → Uçan: bacaksız, büyük kanat, uzun kuyruk
 *   zirh ≥ 2 → Zırhlı: miğfer, omuzluk, göğüslük, kalkan
 *   hiz ≥ 45 → Çevik: öne eğik gövde, uzun burun, uzun kuyruk
 *   boy ≥ 48 → İri: kambur, geniş omuz, dişler, kocaman yumruklar
 *   yoksa      Temel: sivri kulak, küçük kuyruk
 */

import * as THREE from 'three'

import type { CanavarTipi } from '../../kalesavunmasi/config/constants.ts'
import { koni, koyu, kure, kutu } from './yapi.ts'

export type Bicim = 'temel' | 'iri' | 'zirhli' | 'cevik' | 'ucan' | 'sef'

/** Çevik sayılmak için gereken hız ve iri sayılmak için gereken boy. */
const CEVIK_HIZ = 45
const IRI_BOY = 48

export function bicimSec(bilgi: CanavarTipi): Bicim {
  if (bilgi.patron) return 'sef'
  if (bilgi.ucar) return 'ucan'
  if (bilgi.zirh >= 2) return 'zirhli'
  if (bilgi.hiz >= CEVIK_HIZ) return 'cevik'
  if (bilgi.boy >= IRI_BOY) return 'iri'
  return 'temel'
}

export interface BicimParcalari {
  /** Gövde grubu — kafa, kollar ve süsler buraya eklenir. */
  govde: THREE.Group
  solBacak: THREE.Group
  sagBacak: THREE.Group
  onKol: THREE.Group
  arkaKol: THREE.Group
  kutle: THREE.Mesh
  kafa: THREE.Mesh
}

export interface BicimOlculeri {
  en: number
  boy: number
  renk: number
  kalcaY: number
  omuzY: number
  kafaY: number
  kafaR: number
  /** Gövdeyle aynı listeye giren malzeme üretir (isabet parlaması için). */
  malzemeKur: (renk: number) => THREE.MeshLambertMaterial
}

/** Seçilen biçimin süslerini ekler ve gerekirse temel gövdeyi değiştirir. */
export function bicimUygula(bicim: Bicim, p: BicimParcalari, o: BicimOlculeri): void {
  const { govde, kafa } = p
  const { en, boy, renk, kafaY, kafaR, omuzY, kalcaY, malzemeKur } = o
  const koyuRenk = malzemeKur(koyu(renk, 0.45))

  // Ortak: küçük kuyruk (uçan ve çevikte uzun olacak).
  const kuyrukBoy = bicim === 'cevik' || bicim === 'ucan' ? boy * 0.5 : boy * 0.22
  const kuyruk = kutu(en * 0.14, en * 0.14, kuyrukBoy, koyuRenk)
  kuyruk.position.set(0, kalcaY + boy * 0.12, kuyrukBoy / 2 + en * 0.3)
  kuyruk.rotation.x = -0.35
  govde.add(kuyruk)

  if (bicim === 'temel' || bicim === 'cevik' || bicim === 'ucan') {
    // Sivri kulaklar
    for (const yon of [-1, 1]) {
      const kulak = koni(kafaR * 0.42, kafaR * 1.15, koyuRenk, 5)
      kulak.position.set(yon * kafaR * 0.85, kafaY + kafaR * 0.65, 0)
      kulak.rotation.z = yon * -0.5
      govde.add(kulak)
    }
  }

  if (bicim === 'iri' || bicim === 'sef') {
    // Kambur sırt ve kocaman yumruklar
    // Kambur sırtta kalsın: yukarı taşınca kafayı örtüyordu.
    const kambur = kure(en * 0.38, malzemeKur(koyu(renk, 0.18)), 10)
    kambur.position.set(0, omuzY + boy * 0.02, en * 0.34)
    kambur.scale.set(1, 0.7, 0.8)
    govde.add(kambur)
    for (const kol of [p.onKol, p.arkaKol]) {
      const yumruk = kure(en * 0.2, koyuRenk, 8)
      yumruk.position.y = -boy * 0.34
      kol.add(yumruk)
    }
    // Dişler
    for (const yon of [-1, 1]) {
      const dis = koni(kafaR * 0.18, kafaR * 0.55, malzemeKur(0xf8fafc), 5)
      dis.position.set(yon * kafaR * 0.4, kafaY - kafaR * 0.5, -kafaR * 0.75)
      dis.rotation.x = Math.PI
      govde.add(dis)
    }
  }

  if (bicim === 'zirhli') {
    // Miğfer, omuzluklar, göğüslük ve kalkan
    const celik = malzemeKur(0x94a3b8)
    const migfer = kure(kafaR * 1.18, celik, 10)
    migfer.position.y = kafaY + kafaR * 0.2
    migfer.scale.y = 0.72
    const tepelik = kutu(2.5, kafaR * 0.9, kafaR * 1.9, malzemeKur(0xdc2626))
    tepelik.position.y = kafaY + kafaR * 0.95
    const gogus = kutu(en * 0.92, boy * 0.3, en * 0.62, celik)
    gogus.position.y = kalcaY + boy * 0.3
    govde.add(migfer, tepelik, gogus)
    for (const yon of [-1, 1]) {
      const omuzluk = kure(en * 0.26, celik, 8)
      omuzluk.position.set(yon * en * 0.55, omuzY + boy * 0.02, 0)
      omuzluk.scale.y = 0.7
      govde.add(omuzluk)
    }
    const kalkan = kutu(3, boy * 0.42, en * 0.55, celik)
    kalkan.position.set(0, -boy * 0.16, -en * 0.28)
    p.arkaKol.add(kalkan)
    kafa.scale.setScalar(0.9)
  }

  if (bicim === 'cevik') {
    // Öne eğik gövde, uzun burun: koşan hayvan silueti
    govde.rotation.x = 0.34
    const burun = koni(kafaR * 0.5, kafaR * 1.4, malzemeKur(koyu(renk, 0.15)), 6)
    burun.position.set(0, kafaY - kafaR * 0.2, -kafaR * 1.1)
    burun.rotation.x = -Math.PI / 2
    govde.add(burun)
    p.kutle.scale.set(0.88, 0.92, 1.25)
  }

  if (bicim === 'ucan') {
    // Bacaklar görünmesin, gövde havada asılı dursun
    p.solBacak.visible = false
    p.sagBacak.visible = false
    govde.rotation.x = 0.2
    for (const yon of [-1, 1]) {
      const boynuz = koni(kafaR * 0.3, kafaR * 0.9, koyuRenk, 5)
      boynuz.position.set(yon * kafaR * 0.55, kafaY + kafaR * 1.05, 0)
      boynuz.rotation.z = yon * -0.3
      govde.add(boynuz)
    }
  }

  if (bicim === 'sef') {
    // Boynuz, taç, pelerin ve topuz
    for (const yon of [-1, 1]) {
      const boynuz = koni(kafaR * 0.34, kafaR * 1.5, malzemeKur(0xf1f5f9), 6)
      boynuz.position.set(yon * kafaR * 0.9, kafaY + kafaR * 0.9, 0)
      boynuz.rotation.z = yon * -0.75
      govde.add(boynuz)
    }
    const tac = new THREE.Mesh(
      new THREE.TorusGeometry(kafaR * 0.8, kafaR * 0.16, 6, 14),
      malzemeKur(0xfbbf24),
    )
    tac.rotation.x = Math.PI / 2
    tac.position.y = kafaY + kafaR * 0.75
    const pelerin = kutu(en * 1.05, boy * 0.62, 3, malzemeKur(0x7f1d1d))
    pelerin.position.set(0, kalcaY + boy * 0.34, en * 0.42)
    const sap = kutu(en * 0.12, boy * 0.5, en * 0.12, malzemeKur(0x78350f))
    sap.position.y = -boy * 0.2
    const topuz = kure(en * 0.26, malzemeKur(0x64748b), 8)
    topuz.position.y = -boy * 0.46
    p.onKol.add(sap, topuz)
    govde.add(tac, pelerin)
  }
}
