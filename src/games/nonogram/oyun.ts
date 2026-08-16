import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'nonogram',
  ad: "Nonogram",
  ozet: "Kenardaki ipuçlarına göre resmi ortaya çıkar.",
  aciklama: "Kenardaki sayılara göre doğru kareleri boya.",
  ipucu: "Kareye dokun → boya · uzun bas / sağ tık → çarpı koy",
  emoji: '🔲',
  kategori: 'mantik',
  etiketler: ['Mantık', 'Resim'],
  renk: ['#e879f9', '#86198f'],
  tuval: { genislik: 510, yukseklik: 510, disPay: 290 },
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
        etiket: "5×5",
        deger: "kolay"
      },
      {
        etiket: "10×10",
        deger: "orta"
      },
      {
        etiket: "15×15",
        deger: "zor"
      }
    ]
  },
  sahne: () => import('./scenes/GameScene.ts'),
})
