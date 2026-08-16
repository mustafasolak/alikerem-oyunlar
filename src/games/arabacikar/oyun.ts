import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'arabacikar',
  ad: "Araba Çıkarma",
  ozet: "Trafiği çözüp kırmızı arabayı çıkışa ulaştır.",
  aciklama: "Kırmızı arabayı çıkışa ulaştır.",
  ipucu: "Arabaya dokun, sonra gideceği yöne dokun · araçlar yalnız kendi ekseninde kayar",
  emoji: '🚗',
  kategori: 'yerlestirme',
  etiketler: ['Mantık', 'Klasik'],
  renk: ['#f87171', '#991b1b'],
  tuval: { genislik: 510, yukseklik: 510, disPay: 290 },
  arayuz: {
    rozetler: [
      {
        etiket: "Bölüm",
        id: "level",
        baslangic: "1"
      },
      {
        etiket: "Hamle",
        id: "moves",
        baslangic: "0"
      }
    ]
  },
  sahne: () => import('./scenes/GameScene.ts'),
})
