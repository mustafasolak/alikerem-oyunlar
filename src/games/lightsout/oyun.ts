import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'lightsout',
  ad: "Lights Out",
  ozet: "Bir kareye bas, komşuları da değişsin. Bütün ışıkları söndür.",
  aciklama: "Bir kareye bas, kendisi ve komşuları değişsin. Hepsini söndür.",
  ipucu: "Kareye dokun · basınca kendisi ve dört komşusu yanıp söner",
  emoji: '💡',
  kategori: 'mantik',
  etiketler: ['Mantık', 'Sakin'],
  renk: ['#facc15', '#a16207'],
  tuval: { genislik: 510, yukseklik: 510, disPay: 250 },
  arayuz: {
    rozetler: [
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
