/**
 * Sunucu köprüsü — skor gönderme ve global tablo okuma.
 *
 * Temel ilke: sunucu asla zorunlu bağımlılık değildir. İlk istek başarısız
 * olursa köprü kendini kapatır ve bir daha denemez; site cihaz tablosuyla
 * eksiksiz çalışmaya devam eder.
 */

export interface TabloKaydi {
  sira: number
  ad: string
  skor: number
  dogrulandi: boolean
  ben: boolean
}

export type Donem = 'gunluk' | 'haftalik' | 'aylik' | 'tum'

type Durum = 'bilinmiyor' | 'hazirlaniyor' | 'acik' | 'kapali'

const ZAMAN_ASIMI = 4000

async function iste(yol: string, ayar: RequestInit = {}): Promise<Response | null> {
  const kesici = AbortSignal.timeout(ZAMAN_ASIMI)
  try {
    return await fetch(yol, { credentials: 'same-origin', signal: kesici, ...ayar })
  } catch {
    return null
  }
}

class Sunucu {
  private durum: Durum = 'bilinmiyor'
  private hazirlik: Promise<boolean> | null = null

  /** Sunucu kullanılabilir mi? Sonuç önbelleklenir. */
  async hazir(): Promise<boolean> {
    if (this.durum === 'acik') return true
    if (this.durum === 'kapali') return false
    if (this.hazirlik) return this.hazirlik

    this.durum = 'hazirlaniyor'
    this.hazirlik = (async () => {
      const yanit = await iste('/api/saglik')
      if (!yanit?.ok) {
        this.durum = 'kapali'
        return false
      }
      const govde = (await yanit.json().catch(() => null)) as
        | { veritabani?: boolean; sema?: boolean; anahtar?: boolean }
        | null
      if (!govde?.veritabani || !govde.sema || !govde.anahtar) {
        this.durum = 'kapali'
        return false
      }
      // Kimlik çerezi yoksa alalım
      await iste('/api/kimlik', { method: 'POST' })
      this.durum = 'acik'
      return true
    })()

    return this.hazirlik
  }

  /** Skoru gönderir. Başarısızlık sessizdir — oyun akışı bozulmaz. */
  async skorGonder(oyunId: string, skor: number, ad: string, sure?: number): Promise<boolean> {
    if (!(await this.hazir())) return false
    const yanit = await iste('/api/skor', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ oyunId, skor, ad, sure }),
    })
    return Boolean(yanit?.ok)
  }

  /**
   * Katalogda gizlenecek oyunlar. Sunucu yoksa boş dizi döner —
   * yani sunucu kapalıyken bütün oyunlar görünür kalır.
   */
  async gizliOyunlar(): Promise<string[]> {
    if (!(await this.hazir())) return []
    const yanit = await iste('/api/oyunlar')
    if (!yanit?.ok) return []
    const govde = (await yanit.json().catch(() => null)) as { gizli?: string[] } | null
    return Array.isArray(govde?.gizli) ? govde.gizli : []
  }

  /** Yönetim ucuna istek. Panelin dışından kullanılmaz. */
  async yonetim(ayar: RequestInit = {}): Promise<Response | null> {
    return iste('/api/yonetim', ayar)
  }

  /** Global tablo; sunucu kapalıysa null. */
  async tablo(oyunId: string, donem: Donem = 'tum', adet = 10): Promise<TabloKaydi[] | null> {
    if (!(await this.hazir())) return null
    const yanit = await iste(`/api/tablo?oyun=${encodeURIComponent(oyunId)}&donem=${donem}&adet=${adet}`)
    if (!yanit?.ok) return null
    const govde = (await yanit.json().catch(() => null)) as { kayitlar?: TabloKaydi[] } | null
    return govde?.kayitlar ?? null
  }
}

export const sunucu = new Sunucu()
