/**
 * Bütün SQL burada. İşleyiciler (`skor.ts`, `tablo.ts`, …) sorgu yazmaz.
 *
 * Her işlev `sql` etiketli şablonunu parametre olarak alır. Böylece testler
 * aynı işlevleri gerçek bir Postgres (PGlite) üzerinde çalıştırabilir —
 * sorgu metni test ile üretim arasında ayrışamaz.
 */

/** `neon()` ve PGlite köprüsünün ortak arayüzü. */
export type Sorgulayici = (parcalar: TemplateStringsArray, ...degerler: unknown[]) => Promise<Kayit[]>
type Kayit = Record<string, unknown>

/** Hız kısıtı: bir oyuncu bu pencerede en çok bu kadar gönderim yapabilir. */
export const PENCERE_SN = 60
export const PENCERE_SINIRI = 40

/** Şemadaki `skor_ust_siniri` varsayılanı; panel yeni oyunlar için bunu gösterir. */
export const VARSAYILAN_UST_SINIR = 200000

export interface OyunAyari {
  gizli: boolean
  ustSinir: number
}

/** Oyun kaydını (yoksa varsayılanla) getirir. */
export async function oyunAyari(sql: Sorgulayici, oyunId: string): Promise<OyunAyari> {
  const [satir] = await sql`
    insert into oyunlar (id) values (${oyunId})
    on conflict (id) do update set id = excluded.id
    returning gizli, skor_ust_siniri`
  return {
    gizli: Boolean(satir?.gizli),
    ustSinir: Number(satir?.skor_ust_siniri ?? 0),
  }
}

/** Oyuncuyu kaydeder/adını günceller ve sabit pencereli sayacı ilerletir. */
export async function gonderimSay(sql: Sorgulayici, uid: string, ad: string): Promise<number> {
  const [satir] = await sql`
    insert into oyuncular (uid, ad, pencere_basi, pencere_sayaci)
    values (${uid}, ${ad}, now(), 1)
    on conflict (uid) do update set
      ad = excluded.ad,
      pencere_basi = case
        when oyuncular.pencere_basi > now() - make_interval(secs => ${PENCERE_SN})
        then oyuncular.pencere_basi else now() end,
      pencere_sayaci = case
        when oyuncular.pencere_basi > now() - make_interval(secs => ${PENCERE_SN})
        then oyuncular.pencere_sayaci + 1 else 1 end
    returning pencere_sayaci`
  return Number(satir?.pencere_sayaci ?? 1)
}

/**
 * Skoru bir döneme yazar. Yalnız daha iyi skor eskisini ezer.
 * Geriye satırın gerçekten değişip değişmediği döner.
 */
export async function skorYaz(
  sql: Sorgulayici,
  oyunId: string,
  uid: string,
  donem: string,
  ad: string,
  skor: number,
  sureSn: number | null,
): Promise<boolean> {
  const satirlar = await sql`
    insert into skorlar (oyun_id, uid, donem, ad, skor, sure_sn)
    values (${oyunId}, ${uid}, ${donem}, ${ad}, ${skor}, ${sureSn})
    on conflict (oyun_id, uid, donem) do update
      set skor = excluded.skor, ad = excluded.ad, sure_sn = excluded.sure_sn, zaman = now()
      where excluded.skor > skorlar.skor
    returning skor`
  return satirlar.length > 0
}

export interface TabloSatiri {
  sira: number
  ad: string
  skor: number
  dogrulandi: boolean
  ben: boolean
}

/** Bir oyunun bir dönemdeki ilk `adet` kaydı. */
export async function tabloOku(
  sql: Sorgulayici,
  oyunId: string,
  donem: string,
  adet: number,
  uid: string | null,
): Promise<TabloSatiri[]> {
  const satirlar = await sql`
    select ad, skor, dogrulandi, uid
    from skorlar
    where oyun_id = ${oyunId} and donem = ${donem}
    order by skor desc, zaman asc
    limit ${adet}`
  return satirlar.map((s, i) => ({
    sira: i + 1,
    ad: String(s.ad),
    skor: Number(s.skor),
    dogrulandi: Boolean(s.dogrulandi),
    ben: uid !== null && s.uid === uid,
  }))
}

/** Şema kurulu mu? `/api/saglik` bunu sorar. */
export async function semaVarMi(sql: Sorgulayici): Promise<boolean> {
  try {
    await sql`select 1 from skorlar limit 1`
    await sql`select pencere_sayaci from oyuncular limit 1`
    return true
  } catch {
    return false
  }
}

// --- Yönetim paneli ---

export interface YonetimOyun {
  id: string
  gizli: boolean
  oneCikan: number | null
  ustSinir: number
  kayit: number
  oyuncu: number
  enYuksek: number
  sonKayit: string | null
}

/**
 * Panel için oyun listesi: ayarlar + `skorlar` tablosundan türetilen sayılar.
 * Oynanma telemetrisi henüz yok; sayılar skor gönderimlerinden çıkarılıyor.
 */
export async function yonetimOyunlari(sql: Sorgulayici): Promise<YonetimOyun[]> {
  const satirlar = await sql`
    select
      o.id,
      o.gizli,
      o.one_cikan,
      o.skor_ust_siniri,
      coalesce(s.kayit, 0)   as kayit,
      coalesce(s.oyuncu, 0)  as oyuncu,
      coalesce(s.en_yuksek, 0) as en_yuksek,
      s.son_kayit
    from oyunlar o
    left join (
      select oyun_id,
             count(*)::int              as kayit,
             count(distinct uid)::int   as oyuncu,
             max(skor)::int             as en_yuksek,
             max(zaman)                 as son_kayit
      from skorlar where donem = 'tum'
      group by oyun_id
    ) s on s.oyun_id = o.id
    order by o.id`
  return satirlar.map((r) => ({
    id: String(r.id),
    gizli: Boolean(r.gizli),
    oneCikan: r.one_cikan === null ? null : Number(r.one_cikan),
    ustSinir: Number(r.skor_ust_siniri),
    kayit: Number(r.kayit),
    oyuncu: Number(r.oyuncu),
    enYuksek: Number(r.en_yuksek),
    sonKayit: r.son_kayit ? new Date(String(r.son_kayit)).toISOString() : null,
  }))
}

/** Oyun ayarlarını günceller; satır yoksa açar. */
export async function oyunAyarla(
  sql: Sorgulayici,
  oyunId: string,
  gizli: boolean,
  oneCikan: number | null,
  ustSinir: number,
): Promise<void> {
  await sql`
    insert into oyunlar (id, gizli, one_cikan, skor_ust_siniri)
    values (${oyunId}, ${gizli}, ${oneCikan}, ${ustSinir})
    on conflict (id) do update set
      gizli = excluded.gizli,
      one_cikan = excluded.one_cikan,
      skor_ust_siniri = excluded.skor_ust_siniri`
}

/** Katalogda gizlenecek oyun kimlikleri. */
export async function gizliOyunlar(sql: Sorgulayici): Promise<string[]> {
  const satirlar = await sql`select id from oyunlar where gizli = true`
  return satirlar.map((r) => String(r.id))
}

/**
 * Ana sayfa vitrini: `one_cikan` sırasına göre. Gizlenen oyun vitrine girmez —
 * yoksa gizlenmiş bir oyun ana sayfanın en üstünde durmaya devam ederdi.
 */
export async function vitrinOyunlari(sql: Sorgulayici): Promise<string[]> {
  const satirlar = await sql`
    select id from oyunlar
    where one_cikan is not null and gizli = false
    order by one_cikan asc, id asc`
  return satirlar.map((r) => String(r.id))
}

/**
 * Vitrini bütünüyle yeniden yazar: verilen sıra `one_cikan` olur,
 * listede olmayan her oyunun vitrin işareti kalkar.
 */
export async function vitriniAyarla(sql: Sorgulayici, kimlikler: string[]): Promise<void> {
  await sql`update oyunlar set one_cikan = null where one_cikan is not null`
  for (const [sira, id] of kimlikler.entries()) {
    await sql`
      insert into oyunlar (id, one_cikan) values (${id}, ${sira + 1})
      on conflict (id) do update set one_cikan = excluded.one_cikan`
  }
}

export interface DenetimKaydi {
  oyunId: string
  uid: string
  ad: string
  skor: number
  donem: string
  zaman: string
}

/** Denetim için son gönderimler (bütün dönemler). */
export async function sonSkorlar(sql: Sorgulayici, adet: number): Promise<DenetimKaydi[]> {
  const satirlar = await sql`
    select oyun_id, uid, ad, skor, donem, zaman
    from skorlar
    order by zaman desc
    limit ${adet}`
  return satirlar.map((r) => ({
    oyunId: String(r.oyun_id),
    uid: String(r.uid),
    ad: String(r.ad),
    skor: Number(r.skor),
    donem: String(r.donem),
    zaman: new Date(String(r.zaman)).toISOString(),
  }))
}

/**
 * Bir oyuncunun bir oyundaki bütün skorlarını siler (dört dönem birden).
 * Tek dönemi silmek tabloları tutarsız bırakırdı.
 */
export async function skorlariSil(sql: Sorgulayici, oyunId: string, uid: string): Promise<number> {
  const satirlar = await sql`
    delete from skorlar where oyun_id = ${oyunId} and uid = ${uid} returning 1 as silindi`
  return satirlar.length
}

/** Son 14 günün gönderim sayısı (grafik için). */
export async function gunlukHareket(sql: Sorgulayici): Promise<{ gun: string; adet: number }[]> {
  const satirlar = await sql`
    select to_char(zaman at time zone 'Europe/Istanbul', 'YYYY-MM-DD') as gun,
           count(*)::int as adet
    from skorlar
    where donem = 'tum' and zaman > now() - interval '14 days'
    group by gun order by gun`
  return satirlar.map((r) => ({ gun: String(r.gun), adet: Number(r.adet) }))
}

export interface Ozet {
  /** Skor göndermiş farklı oyuncu. */
  oyuncu: number
  /** Siteye girip anonim kimlik almış tarayıcı (oynamamış olabilir). */
  kimlik: number
  kayit: number
  oyun: number
}

/** Toplamlar. */
export async function ozet(sql: Sorgulayici): Promise<Ozet> {
  const [r] = await sql`
    select
      (select count(distinct uid)::int from skorlar)                 as oyuncu,
      (select count(*)::int from oyuncular)                          as kimlik,
      (select count(*)::int from skorlar where donem = 'tum')        as kayit,
      (select count(distinct oyun_id)::int from skorlar)             as oyun`
  return {
    oyuncu: Number(r?.oyuncu ?? 0),
    kimlik: Number(r?.kimlik ?? 0),
    kayit: Number(r?.kayit ?? 0),
    oyun: Number(r?.oyun ?? 0),
  }
}

/** Kimlik verilirken oyuncu satırını açar. */
export async function oyuncuAc(sql: Sorgulayici, uid: string): Promise<void> {
  await sql`insert into oyuncular (uid) values (${uid}) on conflict (uid) do nothing`
}
