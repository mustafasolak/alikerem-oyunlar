import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'ayna',
  ad: "Aynalarla Lazer",
  ozet: "Ayna açılarını ayarlayıp ışığı hedeflerden geçir.",
  aciklama: "Ayna açılarını ayarla, ışığı hedefe taşı.",
  ipucu: "Aynaya dokun → yönü değişir · ışık bütün hedeflerden geçmeli",
  emoji: '🪞',
  kategori: 'mantik',
  etiketler: ['Mantık', 'Işık'],
  renk: ['#c084fc', '#6b21a8'],
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
