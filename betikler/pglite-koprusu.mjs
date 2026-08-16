/**
 * `api/_veritabani.ts` yerine geçen bellek-içi Postgres.
 * Yalnız yerel deneme ve testler için; üretime çıkmaz.
 */
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import { PGlite } from '@electric-sql/pglite'

const db = new PGlite()

export const veritabaniVar = true

export const sql = async (parcalar, ...degerler) => {
  const metin = parcalar.reduce(
    (acc, p, i) => acc + p + (i < degerler.length ? `$${i + 1}` : ''),
    '',
  )
  const sonuc = await db.query(metin, degerler)
  return sonuc.rows
}

/** Şemayı kurar. Sunucu açılışında bir kez çağrılır. */
export async function kur() {
  const sema = await readFile(fileURLToPath(new URL('sema.sql', import.meta.url)), 'utf8')
  await db.exec(sema)
}
