import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'kopru',
  ad: "Köprü Kurma",
  ozet: "Her adayı üstündeki sayı kadar köprüyle bağla.",
  aciklama: "Adaları sayısı kadar köprüyle bağla.",
  ipucu: "İki adaya sırayla dokun → köprü kurulur · tekrar dokun → ikinci köprü, bir daha → kaldırır",
  emoji: '🌉',
  kategori: 'mantik',
  etiketler: ['Mantık', 'Bağlantı'],
  renk: ['#38bdf8', '#0c4a6e'],
  tuval: { genislik: 510, yukseklik: 510, disPay: 280 },
  arayuz: {
    rozetler: [
      {
        etiket: "Kalan",
        id: "remaining",
        baslangic: "0"
      },
      {
        etiket: "Süre",
        id: "timer",
        baslangic: "0:00"
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
