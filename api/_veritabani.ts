/**
 * Veritabanı erişimi tek yerde toplanır.
 *
 * Neon'un HTTP sürücüsü kullanılıyor: sunucusuz işlevlerde bağlantı havuzu
 * tükenmesi derdi olmuyor. Sağlayıcı değişirse yalnız bu dosya değişir.
 */
import { neon } from '@neondatabase/serverless'

const BAGLANTI =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL ??
  process.env.POSTGRES_PRISMA_URL ??
  ''

export const veritabaniVar = Boolean(BAGLANTI)

/** Etiketli şablon: sql`select ...` — parametreler otomatik kaçırılır. */
export const sql = veritabaniVar ? neon(BAGLANTI) : null
