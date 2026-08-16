import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'sayipiramidi',
  ad: "Sayı Piramidi",
  ozet: "Her taş altındaki iki taşın toplamı; eksikleri tamamla.",
  aciklama: "Her taş, altındaki iki taşın toplamı olsun.",
  ipucu: "Boş taşa dokun, rakamları yaz · her taş altındaki ikisinin toplamı",
  emoji: '🔺',
  kategori: 'mantik',
  etiketler: ['Matematik', 'Mantık'],
  renk: ['#fbbf24', '#b45309'],
  tuval: { genislik: 510, yukseklik: 450, disPay: 330 },
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
    ],
    tusTakimi: true
  },
  sahne: () => import('./scenes/GameScene.ts'),
})
