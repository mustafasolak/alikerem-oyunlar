/**
 * API yardımcıları: yanıt biçimi, imzalı oyuncu kimliği, dönem hesabı.
 *
 * Kimlik anonimdir: giriş yok, e-posta yok. Sunucu rastgele bir uid üretip
 * HMAC ile imzalar ve httpOnly çerezde tutar. Çerez kurcalanırsa imza tutmaz.
 */
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'

export interface Istek {
  method?: string
  body?: unknown
  query?: Record<string, string | string[] | undefined>
  headers: Record<string, string | string[] | undefined>
}

export interface Yanit {
  status: (kod: number) => Yanit
  json: (govde: unknown) => void
  setHeader: (ad: string, deger: string | string[]) => void
}

const GIZLI = process.env.OYUN_GIZLI_ANAHTAR ?? ''
export const gizliVar = GIZLI.length >= 16

export const CEREZ_ADI = 'oyuncu'
export const YONETIM_CEREZI = 'yonetici'

const YONETIM_PAROLASI = process.env.YONETIM_PAROLASI ?? ''
/** Panel ancak yeterince uzun bir parola tanımlıysa açılır. */
export const yonetimAcik = YONETIM_PAROLASI.length >= 12 && gizliVarKontrol()

function gizliVarKontrol(): boolean {
  return (process.env.OYUN_GIZLI_ANAHTAR ?? '').length >= 16
}

/** Yönetici oturumu bu kadar sürer. */
const YONETIM_OMRU_SN = 60 * 60 * 12
const CEREZ_OMRU = 60 * 60 * 24 * 365 * 2

function imzala(uid: string): string {
  return createHmac('sha256', GIZLI).update(uid).digest('base64url')
}

function cerezOku(istek: Istek, ad: string): string | null {
  const ham = istek.headers.cookie
  const cerezler = typeof ham === 'string' ? ham : ''
  const eslesme = cerezler.match(new RegExp(`(?:^|;\\s*)${ad}=([^;]+)`))
  return eslesme ? decodeURIComponent(eslesme[1]) : null
}

function esitMi(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b))
  } catch {
    return false
  }
}

/**
 * Parola doğruysa yönetici çerezi verir.
 * Karşılaştırma sabit zamanlı; yanlış parolada çağıran taraf gecikme uygular.
 */
export function yonetimGirisi(parola: unknown, yanit: Yanit): boolean {
  if (!yonetimAcik || typeof parola !== 'string') return false
  if (!esitMi(parola, YONETIM_PAROLASI)) return false

  const bitis = String(Math.floor(Date.now() / 1000) + YONETIM_OMRU_SN)
  const deger = encodeURIComponent(`${bitis}.${imzala(`yonetim:${bitis}`)}`)
  yanit.setHeader(
    'Set-Cookie',
    `${YONETIM_CEREZI}=${deger}; Path=/; Max-Age=${YONETIM_OMRU_SN}; HttpOnly; Secure; SameSite=Lax`,
  )
  return true
}

export function yonetimCikisi(yanit: Yanit): void {
  yanit.setHeader('Set-Cookie', `${YONETIM_CEREZI}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`)
}

/** İstek yöneticiden mi geliyor? (imza + süre) */
export function yoneticiMi(istek: Istek): boolean {
  if (!yonetimAcik) return false
  const ham = cerezOku(istek, YONETIM_CEREZI)
  if (!ham) return false

  const [bitis, imza] = ham.split('.')
  if (!bitis || !imza) return false
  if (!/^\d+$/.test(bitis) || Number(bitis) < Math.floor(Date.now() / 1000)) return false
  return esitMi(imza, imzala(`yonetim:${bitis}`))
}

/** Çerezden doğrulanmış uid; yoksa ya da imza tutmuyorsa null. */
export function uidOku(istek: Istek): string | null {
  if (!gizliVar) return null
  const ham = cerezOku(istek, CEREZ_ADI)
  if (!ham) return null

  const [uid, imza] = ham.split('.')
  if (!uid || !imza) return null
  return esitMi(imza, imzala(uid)) ? uid : null
}

/** Yeni kimlik üretir ve çerezi yanıta yazar. */
export function uidUret(yanit: Yanit): string {
  const uid = randomUUID()
  const deger = encodeURIComponent(`${uid}.${imzala(uid)}`)
  yanit.setHeader(
    'Set-Cookie',
    `${CEREZ_ADI}=${deger}; Path=/; Max-Age=${CEREZ_OMRU}; HttpOnly; Secure; SameSite=Lax`,
  )
  return uid
}

/**
 * Dönem etiketleri sunucu saatinden üretilir — istemci dönem uyduramaz.
 *
 * Gün sınırı **Türkiye saatine** göre: UTC kullanılsaydı gece yarısından sonraki
 * üç saat boyunca skorlar "dün"e yazılırdı; çocuk 00:30'da oynayıp skorunu
 * "Bugün" sekmesinde bulamazdı.
 *
 * Hafta numarası ISO'ya göre (yıl sonlarında kaymasın diye).
 */
const BOLGE = 'Europe/Istanbul'
const GUN_BICIMI = new Intl.DateTimeFormat('en-CA', {
  timeZone: BOLGE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function donemler(simdi = new Date()): string[] {
  // en-CA biçimi: "2026-08-17"
  const [yil, ay, gun] = GUN_BICIMI.format(simdi).split('-')

  // ISO hafta hesabı yerel takvim gününden yapılır
  const persembe = new Date(Date.UTC(Number(yil), Number(ay) - 1, Number(gun)))
  persembe.setUTCDate(persembe.getUTCDate() + 4 - (persembe.getUTCDay() || 7))
  const yilBasi = new Date(Date.UTC(persembe.getUTCFullYear(), 0, 1))
  const hafta = Math.ceil(((persembe.getTime() - yilBasi.getTime()) / 86400000 + 1) / 7)

  return [
    `gunluk-${yil}-${ay}-${gun}`,
    `haftalik-${persembe.getUTCFullYear()}-W${String(hafta).padStart(2, '0')}`,
    `aylik-${yil}-${ay}`,
    'tum',
  ]
}

/** Oyun kimliği biçimi — hem gönderimde hem okumada aynı kural. */
export const OYUN_ID_KALIBI = /^[a-z0-9]{2,32}$/

const DONEM_KALIBI = /^(gunluk-\d{4}-\d{2}-\d{2}|haftalik-\d{4}-W\d{2}|aylik-\d{4}-\d{2}|tum)$/

/**
 * İstemciden gelen dönemi tam etikete çevirir.
 * Kısa ad ("gunluk") bugünün etiketi olur; tam etiket biçimi doğrulanır.
 * Tanınmayan değer için null döner.
 */
export function donemCoz(istenen: string): string | null {
  const bugun = donemler()
  const kisa: Record<string, string> = {
    gunluk: bugun[0],
    haftalik: bugun[1],
    aylik: bugun[2],
    tum: 'tum',
  }
  const donem = kisa[istenen] ?? istenen
  return DONEM_KALIBI.test(donem) ? donem : null
}

/** Takma adı sınırlar; boşsa "Misafir". */
export function adTemizle(ham: unknown): string {
  const metin = typeof ham === 'string' ? ham : ''
  const temiz = metin.trim().replace(/\s+/g, ' ').slice(0, 12)
  return temiz || 'Misafir'
}

export function govdeOku(istek: Istek): Record<string, unknown> {
  if (!istek.body) return {}
  if (typeof istek.body === 'string') {
    try {
      return JSON.parse(istek.body) as Record<string, unknown>
    } catch {
      return {}
    }
  }
  return istek.body as Record<string, unknown>
}

export function hata(yanit: Yanit, kod: number, mesaj: string): void {
  yanit.status(kod).json({ tamam: false, mesaj })
}
