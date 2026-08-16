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

/** Kimlik verilirken oyuncu satırını açar. */
export async function oyuncuAc(sql: Sorgulayici, uid: string): Promise<void> {
  await sql`insert into oyuncular (uid) values (${uid}) on conflict (uid) do nothing`
}
