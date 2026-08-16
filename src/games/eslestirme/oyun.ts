import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'eslestirme',
  ad: "Eşleştirme Oyunu",
  ozet: "Hayvan-yavrusu, ülke-başkent gibi ikilileri eşleştir.",
  aciklama: "Solla sağı doğru eşleştir.",
  ipucu: "Soldan bir kart seç, sağdan eşini seç",
  emoji: '🔗',
  kategori: 'kagit',
  etiketler: ['Bilgi', 'Eşleştirme'],
  renk: ['#fb7185', '#9f1239'],
  tuval: { genislik: 510, yukseklik: 510, disPay: 280 },
  arayuz: {
    rozetler: [
      {
        etiket: "Kalan",
        id: "remaining",
        baslangic: "6"
      },
      {
        etiket: "Süre",
        id: "timer",
        baslangic: "0:00"
      }
    ]
  },
  sahne: () => import('./scenes/GameScene.ts'),
})
