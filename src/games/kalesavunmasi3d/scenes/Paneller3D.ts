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
  YUKSELTMELER,
  ZORLUKLAR,
} from '../../kalesavunmasi/config/constants.ts'
import { dunyaAcikMi, dunyayaKalan } from '../../kalesavunmasi/systems/Ilerleme.ts'
import type { KaleSavunmasi, Kule } from '../../kalesavunmasi/systems/KaleSavunmasi.ts'
import { butonGrubu } from '../../../shared/dom.ts'

export interface PanelKanca {
  yukseltmeAl(id: string): void
  dunyaSec(sira: number): void
  zorlukSec(sira: number): void
  /** Sahnede seçili boş noktaya kule kurar. */
  kuleKur(tip: number): void
  kuleYukselt(): void
  kuleYik(): void
}

export class Paneller3D {
  private readonly oyun: KaleSavunmasi
  private readonly kanca: PanelKanca
  private readonly malzemeButonlari = new Map<string, HTMLButtonElement>()

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
  tazele(secili: Kule | null, kurmaNoktasiVar: boolean): void {
    const seviyeler = YUKSELTMELER.map((y) => this.oyun.yukseltmeSeviyesi(y.id)).join(',')
    const kuleler = this.oyun.kuleler.map((k) => `${k.tip}.${k.seviye}`).join(',')
    const yeni = `${this.oyun.altin}|${this.oyun.kaleCani}|${this.oyun.asama}|${seviyeler}|${kuleler}|${secili?.id ?? -1}|${kurmaNoktasiVar}`
    if (yeni === this.imza) return
    this.imza = yeni
    this.malzemeleriTazele()
    this.kuleleriTazele(secili, kurmaNoktasiVar)
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
    // Kule tipleri tablodan gelir: yeni tip eklenince düğmesi kendiliğinden bağlanır.
    const anahtarlar = [...KULE_TIPLERI.map((_, i) => String(i)), 'yukselt', 'yik']
    for (const anahtar of anahtarlar) {
      const dugme = document.querySelector<HTMLButtonElement>(`#kule button[data-kule="${anahtar}"]`)
      if (!dugme) continue
      this.kuleButonlari.set(anahtar, dugme)
      this.dinle(dugme, () => {
        if (anahtar === 'yukselt') this.kanca.kuleYukselt()
        else if (anahtar === 'yik') this.kanca.kuleYik()
        else this.kanca.kuleKur(Number(anahtar))
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

  /**
   * Kule düğmeleri: tip düğmeleri ancak sahada boş bir nokta seçiliyken,
   * yükselt/yık ancak bir kule seçiliyken çalışır.
   */
  private kuleleriTazele(kule: Kule | null, kurmaNoktasiVar: boolean): void {
    for (let tip = 0; tip < KULE_TIPLERI.length; tip++) {
      const dugme = this.kuleButonlari.get(String(tip))
      if (!dugme) continue
      const fiyat = KULE_TIPLERI[tip].fiyat[0]
      dugme.disabled = !kurmaNoktasiVar || this.oyun.altin < fiyat
      dugme.title = kurmaNoktasiVar ? KULE_TIPLERI[tip].ozet : 'Önce sahada çime dokun'
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
      const bedel = kule ? this.oyun.kuleYikimBedeli(kule.id) : null
      yik.disabled = bedel === null
      const durum = yik.querySelector('b')
      if (durum) durum.textContent = bedel === null ? '—' : `+${bedel}`
    }
  }
}
