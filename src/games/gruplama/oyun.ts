import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'gruplama',
  ad: "Kelime Gruplama",
  ozet: "On altı kelimeden ortak özellikli dörtlüleri bul.",
  aciklama: "On altı kelimeyi dörder dörder grupla.",
  ipucu: "Dört kelime seç, 'Dene' ile onayla · üç hata hakkın var",
  emoji: '🧩',
  kategori: 'kelime',
  etiketler: ['Kelime', 'Mantık'],
  renk: ['#facc15', '#a16207'],
  tuval: { genislik: 510, yukseklik: 550, disPay: 290 },
  arayuz: {
    rozetler: [
      {
        etiket: "Kalan grup",
        id: "remaining",
        baslangic: "4"
      },
      {
        etiket: "Hata",
        id: "mistakes",
        baslangic: "0"
      }
    ]
  },
  sahne: () => import('./scenes/GameScene.ts'),
})
