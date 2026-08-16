/** GEÇİCİ tanı yardımcısı (api içi, alt çizgisiz). */
export const selam = 'api-ici-merhaba'
export default function handler(_i: unknown, y: { status: (k: number) => { json: (g: unknown) => void } }): void {
  y.status(200).json({ ok: true })
}
