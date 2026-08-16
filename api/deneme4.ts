/** GEÇİCİ — node:crypto ve neon paketi yüklenebiliyor mu? */
import { randomUUID } from 'node:crypto'
import { neon } from '@neondatabase/serverless'
export default function handler(_i: unknown, y: { status: (k: number) => { json: (g: unknown) => void } }): void {
  y.status(200).json({ deneme: 4, uid: randomUUID(), neon: typeof neon })
}
