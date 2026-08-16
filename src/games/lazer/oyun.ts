import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'lazer',
  ad: "Laser Reflection",
  ozet: "Aynaları çevirerek lazer ışınını hedefe düşür.",
  aciklama: "Aynaları çevir, lazeri hedefe ulaştır.",
  ipucu: "Aynaya dokun → yönü değişir · lazer hedefe ulaşmalı",
  emoji: '🔺',
  kategori: 'mantik',
  etiketler: ['Mantık', 'Işık'],
  renk: ['#f87171', '#b91c1c'],
  tuval: { genislik: 510, yukseklik: 510, disPay: 290 },
  arayuz: {
    rozetler: [
      {
        etiket: "Hamle",
        id: "moves",
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
