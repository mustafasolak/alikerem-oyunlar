import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'boru',
  ad: "Boru Bağlama",
  ozet: "Boruları çevirip kaynaktan hedefe kesintisiz yol kur.",
  aciklama: "Boruları çevir, kaynaktan hedefe yol aç.",
  ipucu: "Boruya dokun → 90° döner · bütün borular bağlanınca biter",
  emoji: '🔧',
  kategori: 'mantik',
  etiketler: ['Mantık', 'Bağlantı'],
  renk: ['#a3e635', '#4d7c0f'],
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
