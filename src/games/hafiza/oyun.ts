import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'hafiza',
  ad: "Hafıza Kartları",
  ozet: "Kartları çevir, eşleri bul, en az hamleyle bitir.",
  aciklama: "Kartları çevir, eşleri bul, hepsini aç.",
  ipucu: "Karta dokun, eşini bul · iki kart tutmazsa kapanır",
  emoji: '🃏',
  kategori: 'kagit',
  etiketler: ['Hafıza', 'Sakin'],
  renk: ['#c084fc', '#6b21a8'],
  tuval: { genislik: 510, yukseklik: 510, disPay: 265 },
  arayuz: {
    rozetler: [
      {
        etiket: "Çift",
        id: "pairs",
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
