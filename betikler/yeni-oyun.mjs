#!/usr/bin/env node
/**
 * Yeni oyun iskelesi: `npm run yeni-oyun -- <id> <kategori>`
 *
 * Tek klasör oluşturur — kayıt yok, HTML yok, CSS yok. Katalog kendiliğinden
 * bulur (import.meta.glob) ve `npm run katalog` üstveriyi yazar.
 */
import { mkdir, writeFile, access } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const KOK = join(dirname(fileURLToPath(import.meta.url)), '..')
const [id, kategori = 'mantik'] = process.argv.slice(2)

if (!id || !/^[a-z0-9]+$/.test(id)) {
  console.error('Kullanım: npm run yeni-oyun -- <id> [kategori]\n  id küçük harf ve rakamlardan oluşmalı')
  process.exit(1)
}

const klasor = join(KOK, 'src/games', id)
try {
  await access(klasor)
  console.error(`✗ ${id} zaten var`)
  process.exit(1)
} catch {
  /* yok, devam */
}

await mkdir(join(klasor, 'config'), { recursive: true })
await mkdir(join(klasor, 'systems'), { recursive: true })
await mkdir(join(klasor, 'scenes'), { recursive: true })

const Buyuk = id[0].toUpperCase() + id.slice(1)

await writeFile(join(klasor, 'oyun.ts'), `import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: '${id}',
  ad: '${Buyuk}',
  ozet: 'Kartta görünen bir cümle.',
  aciklama: 'Oyun sayfasındaki alt başlık.',
  ipucu: 'Nasıl oynandığını anlatan kısa satır.',
  emoji: '🎲',
  kategori: '${kategori}',
  etiketler: ['Yeni'],
  renk: ['#60a5fa', '#1d4ed8'],
  tuval: { genislik: 510, yukseklik: 510, disPay: 250 },
  arayuz: {
    rozetler: [{ etiket: 'Hamle', id: 'moves', baslangic: '0' }],
  },
  sahne: () => import('./scenes/GameScene.ts'),
})
`)

await writeFile(join(klasor, 'config/constants.ts'), `/** ${Buyuk} sabitleri. Sihirli sayı burada durur. */

export const GAME_WIDTH = 510
export const GAME_HEIGHT = 510
export const BOARD_PADDING = 12

export const TABAN_PUAN = 1000
export const HAMLE_CEZASI = 10
export const MIN_SKOR = 100

export const COLORS = {
  BOARD: 0x14203a,
  HUCRE: 0x1e2f52,
} as const

export function skorHesapla(hamle: number): number {
  return Math.max(MIN_SKOR, TABAN_PUAN - hamle * HAMLE_CEZASI)
}
`)

await writeFile(join(klasor, `systems/${Buyuk}Oyunu.ts`), `/** ${Buyuk} oyun mantığı — Phaser'dan bağımsız, tek başına test edilebilir. */

import { type Uretec } from '../../../shared/rastgele.ts'

export class ${Buyuk}Oyunu {
  hamle = 0
  bitti = false

  /** Testlerde kestirilebilir olsun diye üreteç dışarıdan verilebilir. */
  protected readonly random: Uretec

  constructor(random: Uretec = Math.random) {
    this.random = random
    this.reset()
  }

  reset(): void {
    this.hamle = 0
    this.bitti = false
  }
}
`)

await writeFile(join(klasor, 'scenes/GameScene.ts'), `import { TemelSahne } from '../../../shared/TemelSahne.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { setChip } from '../../../shared/dom.ts'
import { COLORS, GAME_HEIGHT, GAME_WIDTH, skorHesapla } from '../config/constants.ts'
import { ${Buyuk}Oyunu } from '../systems/${Buyuk}Oyunu.ts'

export class GameScene extends TemelSahne {
  private readonly oyun = new ${Buyuk}Oyunu()

  constructor() {
    super('${id}')
  }

  protected kur(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(14)
    this.input.on('pointerdown', () => this.dokun())
  }

  protected yeniOyun(): void {
    this.oyun.reset()
    setChip('moves', 0)
    this.skorGoster(0)
  }

  private dokun(): void {
    if (this.bitti) return
    this.oyun.hamle++
    sesler.tik()
    setChip('moves', this.oyun.hamle)

    if (this.oyun.bitti) {
      const skor = skorHesapla(this.oyun.hamle)
      this.turuBitir({ baslik: 'Bitti! 🎉', ozet: this.oyun.hamle + ' hamle · Skor: ' + skor, skor })
    }
  }
}
`)

console.log(`✓ src/games/${id}/ hazır
  1) oyun.ts içindeki metinleri ve renkleri düzenle
  2) systems/ içinde mantığı yaz, testini ekle
  3) scenes/GameScene.ts içinde çiz
  4) npm run kontrol`)
