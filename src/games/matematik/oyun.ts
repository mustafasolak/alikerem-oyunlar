import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'matematik',
  ad: "Matematik Bulmacası",
  ozet: "Verilen sayıları işlemlerle birleştirip hedefi yakala.",
  aciklama: "Verilen sayılarla hedefe ulaş.",
  ipucu: "İki sayı ve bir işlem seç · sonuç yeni sayı olur, hedefe ulaş",
  emoji: '➗',
  kategori: 'mantik',
  etiketler: ['Matematik', 'Zekâ'],
  renk: ['#60a5fa', '#1e40af'],
  tuval: { genislik: 510, yukseklik: 510, disPay: 300 },
  arayuz: {
    rozetler: [
      {
        etiket: "Hedef",
        id: "target",
        baslangic: "0"
      },
      {
        etiket: "Hamle",
        id: "moves",
        baslangic: "0"
      }
    ],
    aracCubugu: [
      {
        etiket: "Kolay",
        deger: "kolay"
      },
      {
        etiket: "Orta",
        deger: "orta"
      },
      {
        etiket: "Zor",
        deger: "zor"
      }
    ]
  },
  sahne: () => import('./scenes/GameScene.ts'),
})
