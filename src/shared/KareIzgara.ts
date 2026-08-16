/**
 * Kare ızgara görünümü: hücre zeminleri + yazıları havuzda tutar,
 * imleç konumunu hücreye çevirir. Izgara tabanlı oyunların ortak parçası.
 */

import * as Phaser from 'phaser'

export interface IzgaraAyari {
  sutun: number
  satir: number
  hucreBoyu: number
  ofsetX: number
  ofsetY: number
  /** Hücreler arası boşluk (piksel). */
  bosluk?: number
  radius?: number
  zeminRenk?: number
  yaziRenk?: string
  yaziBoyu?: number
  fontFamily?: string
}

export interface Hucre {
  satir: number
  sutun: number
}

export interface HucreGorunumu {
  zemin: Phaser.GameObjects.Rectangle
  yazi: Phaser.GameObjects.Text
}

const VARSAYILAN_FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

export class KareIzgara {
  readonly sutun: number
  readonly satir: number
  readonly hucreBoyu: number
  readonly ofsetX: number
  readonly ofsetY: number

  readonly katman: Phaser.GameObjects.Container

  private readonly gorunumler: HucreGorunumu[] = []

  constructor(scene: Phaser.Scene, ayar: IzgaraAyari) {
    this.sutun = ayar.sutun
    this.satir = ayar.satir
    this.hucreBoyu = ayar.hucreBoyu
    this.ofsetX = ayar.ofsetX
    this.ofsetY = ayar.ofsetY

    const bosluk = ayar.bosluk ?? 2
    const boyut = this.hucreBoyu - bosluk
    const yaziBoyu = ayar.yaziBoyu ?? Math.round(this.hucreBoyu * 0.5)

    this.katman = scene.add.container(0, 0)

    for (let satir = 0; satir < this.satir; satir++) {
      for (let sutun = 0; sutun < this.sutun; sutun++) {
        const x = this.x(sutun)
        const y = this.y(satir)
        const zemin = scene.add
          .rectangle(x, y, boyut, boyut, ayar.zeminRenk ?? 0x222222)
          .setRounded(ayar.radius ?? 4)
        const yazi = scene.add
          .text(x, y, '', {
            fontFamily: ayar.fontFamily ?? VARSAYILAN_FONT,
            fontSize: `${yaziBoyu}px`,
            fontStyle: 'bold',
            color: ayar.yaziRenk ?? '#ffffff',
          })
          .setOrigin(0.5)
        this.katman.add([zemin, yazi])
        this.gorunumler.push({ zemin, yazi })
      }
    }
  }

  get toplam(): number {
    return this.sutun * this.satir
  }

  index(satir: number, sutun: number): number {
    return satir * this.sutun + sutun
  }

  gorunum(satir: number, sutun: number): HucreGorunumu {
    return this.gorunumler[this.index(satir, sutun)]
  }

  gorunumIndex(index: number): HucreGorunumu {
    return this.gorunumler[index]
  }

  hepsi(): HucreGorunumu[] {
    return this.gorunumler
  }

  x(sutun: number): number {
    return this.ofsetX + sutun * this.hucreBoyu + this.hucreBoyu / 2
  }

  y(satir: number): number {
    return this.ofsetY + satir * this.hucreBoyu + this.hucreBoyu / 2
  }

  /** İmleç konumunu hücreye çevirir; ızgara dışındaysa null. */
  hucreBul(pointer: Phaser.Input.Pointer): Hucre | null {
    const sutun = Math.floor((pointer.worldX - this.ofsetX) / this.hucreBoyu)
    const satir = Math.floor((pointer.worldY - this.ofsetY) / this.hucreBoyu)
    if (sutun < 0 || sutun >= this.sutun || satir < 0 || satir >= this.satir) return null
    return { satir, sutun }
  }

  /** Tüm hücreleri tek seferde boyar/yazar. */
  uygula(fn: (view: HucreGorunumu, satir: number, sutun: number, index: number) => void): void {
    for (let satir = 0; satir < this.satir; satir++) {
      for (let sutun = 0; sutun < this.sutun; sutun++) {
        const index = this.index(satir, sutun)
        fn(this.gorunumler[index], satir, sutun, index)
      }
    }
  }
}

/** Tuvale sığacak en büyük kare hücre boyutunu ve ortalama kaymasını hesaplar. */
export function izgaraYerlesimi(
  tuvalGenislik: number,
  tuvalYukseklik: number,
  sutun: number,
  satir: number,
  kenarBosluk: number,
): { hucreBoyu: number; ofsetX: number; ofsetY: number } {
  const hucreBoyu = Math.floor(
    Math.min((tuvalGenislik - kenarBosluk * 2) / sutun, (tuvalYukseklik - kenarBosluk * 2) / satir),
  )
  return {
    hucreBoyu,
    ofsetX: (tuvalGenislik - sutun * hucreBoyu) / 2,
    ofsetY: (tuvalYukseklik - satir * hucreBoyu) / 2,
  }
}
