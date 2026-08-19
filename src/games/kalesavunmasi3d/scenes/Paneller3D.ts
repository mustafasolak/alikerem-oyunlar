/**
 * Sayfa üstündeki DOM panellerinin bağlanması: zorluk çubuğu, dünya seçimi,
 * yükseltme dükkânı, kule paneli ve tuş takımı yazıları.
 *
 * Üç boyutlu sahnede menüyü tuvale çizmek yerine sayfada bırakmak hem yazıyı
 * keskin tutuyor hem de dokunmatikte hedef büyüklüğünü koruyor. Sahne yalnız
 * hangi yuvanın seçili olduğunu söyler; fiyat, seviye ve pasiflik burada yazılır.
 */

import {
  DUNYALAR,
  ELEMENT_ADI,
  ELEMENT_SIMGE,
  KULE_MAX_SEVIYE,
  KULE_TIPLERI,
  KULE_YUVALARI,
  YUKSELTMELER,
  ZORLUKLAR,
} from '../../kalesavunmasi/config/constants.ts'
import { dunyaAcikMi, dunyayaKalan } from '../../kalesavunmasi/systems/Ilerleme.ts'
import type { KaleSavunmasi } from '../../kalesavunmasi/systems/KaleSavunmasi.ts'
import { butonGrubu } from '../../../shared/dom.ts'

export interface PanelKanca {
  yukseltmeAl(id: string): void
  dunyaSec(sira: number): void
  zorlukSec(sira: number): void
  yuvaSec(yuva: number): void
  kuleAl(tip: number): void
  kuleYukselt(): void
  kuleYik(): void
}

export class Paneller3D {
  private readonly oyun: KaleSavunmasi
  private readonly kanca: PanelKanca
  private readonly malzemeButonlari = new Map<string, HTMLButtonElement>()
  private readonly yuvaButonlari: HTMLButtonElement[] = []
  private readonly kuleButonlari = new Map<string, HTMLButtonElement>()
  private readonly temizleyiciler: (() => void)[] = []
  private dunyayiIsaretle?: (deger: string) => void
  private imza = ''

  constructor(oyun: KaleSavunmasi, kanca: PanelKanca) {
    this.oyun = oyun
    this.kanca = kanca
    this.malzemeleriBagla()
    this.kuleleriBagla()
    this.dunyalariBagla()
    this.zorluklariBagla()
  }

  /** Her karede çağrılır; durum değişmediyse DOM'a hiç yazılmaz. */
  tazele(seciliYuva: number | null): void {
    const seviyeler = YUKSELTMELER.map((y) => this.oyun.yukseltmeSeviyesi(y.id)).join(',')
    const kuleler = this.oyun.kuleler.map((k) => (k ? `${k.tip}.${k.seviye}` : '-')).join(',')
    const yeni = `${this.oyun.altin}|${this.oyun.kaleCani}|${this.oyun.asama}|${seviyeler}|${kuleler}|${seciliYuva}`
    if (yeni === this.imza) return
    this.imza = yeni
    this.malzemeleriTazele()
    this.kuleleriTazele(seciliYuva)
  }

  /** Element ve otomatik düğmelerinin yazısını güncel duruma çeker. */
  padYazilariniTazele(): void {
    const element = document.querySelector<HTMLButtonElement>('#pad button[data-move="element"]')
    if (element) {
      element.textContent = `${ELEMENT_SIMGE[this.oyun.element]} ${ELEMENT_ADI[this.oyun.element]}`
      element.setAttribute('aria-pressed', String(this.oyun.element !== 'normal'))
    }
    const otomatik = document.querySelector<HTMLButtonElement>('#pad button[data-move="otomatik"]')
    if (otomatik) otomatik.setAttribute('aria-pressed', String(this.oyun.otomatik))
  }

  /** Kilitli dünyaların düğmesini kapatır, kalan sayıyı yazar. */
  dunyalariTazele(): void {
    for (let sira = 0; sira < DUNYALAR.length; sira++) {
      const kalan = dunyayaKalan(sira)
      const dugme = document.querySelector<HTMLButtonElement>(`#dunya button[data-dunya="${sira}"]`)
      if (!dugme) continue
      const acik = dunyaAcikMi(sira)
      dugme.disabled = !acik
      dugme.textContent = acik ? DUNYALAR[sira].kisaAd : `🔒 ${DUNYALAR[sira].kisaAd} · ${kalan}`
      dugme.title = acik ? DUNYALAR[sira].ad : `${kalan} canavar daha öldür`
    }
    this.dunyayiIsaretle?.(String(this.oyun.dunyaSira))
  }

  /** Panelleri geniş ekranda açık başlatır; telefonda kapalı kalır. */
  panelleriAc(): void {
    for (const kutu of document.querySelectorAll<HTMLDetailsElement>('details.katlanir')) kutu.open = true
  }

  yikil(): void {
    for (const temizle of this.temizleyiciler) temizle()
    this.temizleyiciler.length = 0
  }

  // --- Bağlama ---

  private dinle(dugme: HTMLButtonElement, isle: () => void): void {
    const bas = (): void => isle()
    dugme.addEventListener('click', bas)
    this.temizleyiciler.push(() => dugme.removeEventListener('click', bas))
  }

  private malzemeleriBagla(): void {
    for (const y of YUKSELTMELER) {
      const dugme = document.querySelector<HTMLButtonElement>(`#malzeme button[data-yukseltme="${y.id}"]`)
      if (!dugme) continue
      this.malzemeButonlari.set(y.id, dugme)
      this.dinle(dugme, () => this.kanca.yukseltmeAl(y.id))
    }
  }

  private kuleleriBagla(): void {
    for (let yuva = 0; yuva < KULE_YUVALARI.length; yuva++) {
      const dugme = document.querySelector<HTMLButtonElement>(`#kule button[data-yuva="${yuva}"]`)
      if (!dugme) continue
      this.yuvaButonlari.push(dugme)
      this.dinle(dugme, () => this.kanca.yuvaSec(yuva))
    }
    for (const anahtar of ['0', '1', '2', 'yukselt', 'yik']) {
      const dugme = document.querySelector<HTMLButtonElement>(`#kule button[data-kule="${anahtar}"]`)
      if (!dugme) continue
      this.kuleButonlari.set(anahtar, dugme)
      this.dinle(dugme, () => {
        if (anahtar === 'yukselt') this.kanca.kuleYukselt()
        else if (anahtar === 'yik') this.kanca.kuleYik()
        else this.kanca.kuleAl(Number(anahtar))
      })
    }
  }

  private dunyalariBagla(): void {
    this.dunyayiIsaretle = butonGrubu('dunya', 'dunya', (deger) => this.kanca.dunyaSec(Number(deger)))
    this.dunyalariTazele()
  }

  private zorluklariBagla(): void {
    const isaretle = butonGrubu('toolbar', 'level', (deger) => {
      const sira = ZORLUKLAR.findIndex((z) => z.id === deger)
      if (sira >= 0) this.kanca.zorlukSec(sira)
    })
    isaretle(this.oyun.zorluk.id)
  }

  /** Seçimi geri alır (kilitli dünya seçilince). */
  dunyayaDon(): void {
    this.dunyayiIsaretle?.(String(this.oyun.dunyaSira))
  }

  // --- Yazma ---

  private malzemeleriTazele(): void {
    for (const y of YUKSELTMELER) {
      const dugme = this.malzemeButonlari.get(y.id)
      if (!dugme) continue
      const seviye = this.oyun.yukseltmeSeviyesi(y.id)
      const fiyat = this.oyun.yukseltmeFiyatiSimdi(y.id)
      dugme.disabled = !this.oyun.yukseltmeAlinabilir(y.id)
      dugme.setAttribute('aria-pressed', String(seviye > 0))

      const durum = dugme.querySelector('b')
      if (!durum) continue
      if (fiyat === null) durum.textContent = y.maxSeviye === 1 ? 'alındı' : 'tam'
      else if (y.maxSeviye > 1) durum.textContent = `Lv${seviye}/${y.maxSeviye} · ${fiyat}`
      else durum.textContent = String(fiyat)
    }
  }

  /** Yuva düğmeleri kulenin durumunu, eylem düğmeleri fiyatı gösterir. */
  private kuleleriTazele(seciliYuva: number | null): void {
    for (let yuva = 0; yuva < this.yuvaButonlari.length; yuva++) {
      const dugme = this.yuvaButonlari[yuva]
      const kule = this.oyun.kuleler[yuva]
      dugme.setAttribute('aria-pressed', String(yuva === seciliYuva))
      dugme.textContent = kule ? `${yuva + 1} · Lv${kule.seviye}` : `${yuva + 1} · boş`
      dugme.title = kule ? KULE_TIPLERI[kule.tip].ad : 'Boş yuva'
    }

    const kule = seciliYuva === null ? null : this.oyun.kuleler[seciliYuva]
    for (let tip = 0; tip < KULE_TIPLERI.length; tip++) {
      const dugme = this.kuleButonlari.get(String(tip))
      if (!dugme) continue
      const fiyat = KULE_TIPLERI[tip].fiyat[0]
      dugme.disabled = seciliYuva === null || kule !== null || this.oyun.altin < fiyat
      const durum = dugme.querySelector('b')
      if (durum) durum.textContent = String(fiyat)
    }

    const yukselt = this.kuleButonlari.get('yukselt')
    if (yukselt) {
      const fiyat = kule && kule.seviye < KULE_MAX_SEVIYE ? KULE_TIPLERI[kule.tip].fiyat[kule.seviye] : null
      yukselt.disabled = fiyat === null || this.oyun.altin < fiyat
      const durum = yukselt.querySelector('b')
      if (durum) durum.textContent = fiyat === null ? (kule ? 'tam' : '—') : String(fiyat)
    }

    const yik = this.kuleButonlari.get('yik')
    if (yik) {
      const bedel = seciliYuva === null ? null : this.oyun.kuleYikimBedeli(seciliYuva)
      yik.disabled = bedel === null
      const durum = yik.querySelector('b')
      if (durum) durum.textContent = bedel === null ? '—' : `+${bedel}`
    }
  }
}
