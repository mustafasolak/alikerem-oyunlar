import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'sekerpatlat',
  ad: "Şeker Patlatma",
  ozet: "Candy Crush tarzı: şekerleri dizip patlat, hedefi tuttur.",
  aciklama: "Şekerleri üçlü dizip patlat.",
  ipucu: "Komşu iki şekeri değiştir · üç ve fazlası patlar",
  emoji: '🍬',
  kategori: 'arcade',
  etiketler: ['Arcade', 'Eşleştirme'],
  renk: ['#fb7185', '#9f1239'],
  tuval: { genislik: 510, yukseklik: 510, disPay: 280 },
  arayuz: {
    rozetler: [
      {
        etiket: "Hamle",
        id: "moves",
        baslangic: "20"
      },
      {
        etiket: "Hedef",
        id: "target",
        baslangic: "1000"
      }
    ]
  },
  sahne: () => import('./scenes/GameScene.ts'),
})
