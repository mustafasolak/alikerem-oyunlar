import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'hanoi',
  ad: "Hanoi Kuleleri",
  ozet: "Diskleri kurallara uyarak son çubuğa taşı.",
  aciklama: "Diskleri son çubuğa taşı; büyük disk küçüğün üstüne gelemez.",
  ipucu: "Diski al, hedef çubuğa dokun · büyük disk küçüğün üstüne konamaz",
  emoji: '🗼',
  kategori: 'yerlestirme',
  etiketler: ['Mantık', 'Klasik'],
  renk: ['#38bdf8', '#0369a1'],
  tuval: { genislik: 510, yukseklik: 420, disPay: 250 },
  arayuz: {
    rozetler: [
      {
        etiket: "Hamle",
        id: "moves",
        baslangic: "0"
      },
      {
        etiket: "En az",
        id: "best-moves",
        baslangic: "7"
      }
    ],
    aracCubugu: [
      {
        etiket: "3 disk",
        deger: "3"
      },
      {
        etiket: "4 disk",
        deger: "4"
      },
      {
        etiket: "5 disk",
        deger: "5"
      },
      {
        etiket: "6 disk",
        deger: "6"
      }
    ]
  },
  sahne: () => import('./scenes/GameScene.ts'),
})
