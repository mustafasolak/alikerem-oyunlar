import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'farkbul',
  ad: "Farkları Bul",
  ozet: "İki desen arasındaki beş farkı bul.",
  aciklama: "İki resim arasındaki farkları bul.",
  ipucu: "Farklı gördüğün şekle dokun · beş fark var",
  emoji: '🔍',
  kategori: 'dikkat',
  etiketler: ['Dikkat', 'Gözlem'],
  renk: ['#2dd4bf', '#0f766e'],
  tuval: { genislik: 510, yukseklik: 700, disPay: 260 },
  arayuz: {
    rozetler: [
      {
        etiket: "Bulunan",
        id: "found",
        baslangic: "0"
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
