/**
 * Hash tabanlı yönlendirici.
 *
 * Hash kullanmamızın sebebi: statik barındırmada (GitHub Pages, Vercel)
 * sunucu ayarı gerektirmez, derin bağlantı hiçbir koşulda kırılmaz.
 *
 * Her sayfa, ayrılırken çağrılacak bir temizleme işlevi döndürür — Phaser
 * örneğini yıkmak için bu şart.
 */

export type Temizleyici = () => void
export type SayfaCizici = (parametre: string) => Promise<Temizleyici> | Temizleyici

export interface Rota {
  /** '#/oyun/' gibi önek; '' ana sayfa demek. */
  onek: string
  ciz: SayfaCizici
}

export class Yonlendirici {
  private readonly rotalar: Rota[]
  private temizle: Temizleyici | null = null
  /** Aynı anda iki sayfa kurulmasın diye. */
  private surumNo = 0

  constructor(rotalar: Rota[]) {
    this.rotalar = rotalar
  }

  basla(): void {
    addEventListener('hashchange', () => void this.ciz())
    void this.ciz()
  }

  /** Adres çubuğunu değiştirir; hashchange zincirini tetikler. */
  static git(yol: string): void {
    location.hash = yol
  }

  private async ciz(): Promise<void> {
    const surum = ++this.surumNo
    const hash = location.hash || '#/'

    // Önceki sayfayı kapat
    this.temizle?.()
    this.temizle = null

    const rota =
      this.rotalar.find((r) => r.onek !== '' && hash.startsWith(r.onek)) ??
      this.rotalar.find((r) => r.onek === '')
    if (!rota) return

    const parametre = rota.onek === '' ? '' : decodeURIComponent(hash.slice(rota.onek.length))
    const sonuc = await rota.ciz(parametre)

    // Çizim sürerken başka sayfaya geçildiyse bunu hemen kapat
    if (surum !== this.surumNo) {
      sonuc()
      return
    }
    this.temizle = sonuc
  }
}
