/** GET /api/saglik — sunucu ve veritabanı durumu (istemci buna göre kendini kapatır). */
import { gizliVar, type Istek, type Yanit } from './_ortak.ts'
import { semaVarMi } from './_sorgular.ts'
import { sql, veritabaniVar } from './_veritabani.ts'

export default async function handler(_istek: Istek, yanit: Yanit): Promise<void> {
  const sema = veritabaniVar && sql ? await semaVarMi(sql) : false
  yanit.setHeader('Cache-Control', 'no-store')
  yanit.status(200).json({ tamam: true, veritabani: veritabaniVar, sema, anahtar: gizliVar })
}
