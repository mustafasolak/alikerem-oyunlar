/** POST /api/kimlik — anonim oyuncu kimliği verir (çerezde). */
import { gizliVar, hata, uidOku, uidUret, type Istek, type Yanit } from './_ortak.ts'
import { oyuncuAc } from './_sorgular.ts'
import { sql, veritabaniVar } from './_veritabani.ts'

export default async function handler(istek: Istek, yanit: Yanit): Promise<void> {
  if (!gizliVar) return hata(yanit, 503, 'OYUN_GIZLI_ANAHTAR tanımlı değil')

  let uid = uidOku(istek)
  const yeni = !uid
  if (!uid) uid = uidUret(yanit)

  if (yeni && veritabaniVar && sql) {
    try {
      await oyuncuAc(sql, uid)
    } catch {
      /* kimlik yine de geçerli; kayıt sonraki gönderimde düşer */
    }
  }

  yanit.status(200).json({ tamam: true, uid, yeni })
}
