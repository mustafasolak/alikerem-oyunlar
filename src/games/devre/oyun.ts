import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'devre',
  ad: "Elektrik Devresi",
  ozet: "Kabloları döndürüp akımı bütün ampullere ulaştır.",
  aciklama: "Kabloları çevir, akımı ampullere ulaştır.",
  ipucu: "Kabloya dokun → 90° döner · bütün ampuller yanınca biter",
  emoji: '💡',
  kategori: 'mantik',
  etiketler: ['Mantık', 'Bağlantı'],
  renk: ['#facc15', '#a16207'],
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
