import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'kakuro',
  ad: "Kakuro",
  ozet: "Rakamları topla, her dizinin hedefini tuttur.",
  aciklama: "Her diziyi verilen toplama ulaşacak rakamlarla doldur.",
  ipucu: "Kareye dokun, rakam seç · bir dizide aynı rakam iki kez geçemez",
  emoji: '➕',
  kategori: 'mantik',
  etiketler: ['Matematik', 'Mantık'],
  renk: ['#4ade80', '#15803d'],
  tuval: { genislik: 510, yukseklik: 510, disPay: 340 },
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
      }
    ],
    tusTakimi: true
  },
  sahne: () => import('./scenes/GameScene.ts'),
})
