import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'mahjong',
  ad: "Mahjong",
  ozet: "Kenarı açık aynı taşları eşleştirip tahtayı boşalt.",
  aciklama: "Serbest taşları ikişer ikişer eşleştir.",
  ipucu: "Üstü açık ve yanı boş taşlara dokun · aynı iki taş birlikte kalkar · takılırsan <b>İpucu</b>",
  emoji: '🀄',
  kategori: 'kagit',
  etiketler: ['Eşleştirme', 'Sakin'],
  renk: ['#4ade80', '#166534'],
  tuval: { genislik: 510, yukseklik: 470, disPay: 300 },
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
    pad: [{ etiket: '💡 İpucu', deger: 'ipucu' }]
  },
  sahne: () => import('./scenes/GameScene.ts'),
})
