import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'gizlinesne',
  ad: "Gizli Nesne",
  ozet: "Kalabalığın içine saklanan nesneleri bul.",
  aciklama: "Listedeki nesneleri kalabalıkta bul.",
  ipucu: "Aranan nesneye dokun · yanlış dokunuş süre götürür",
  emoji: '🔎',
  kategori: 'dikkat',
  etiketler: ['Dikkat', 'Gözlem'],
  renk: ['#f472b6', '#9d174d'],
  tuval: { genislik: 510, yukseklik: 510, disPay: 320 },
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
    paneller: [
      {
        id: "wanted",
        baslik: "Aranan nesneler",
        ic: "<ul class=\"word-list\" id=\"wanted-list\"></ul>"
      }
    ]
  },
  sahne: () => import('./scenes/GameScene.ts'),
})
