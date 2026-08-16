import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'resimtamamla',
  ad: "Resim Tamamlama",
  ozet: "Resimden eksilen parçayı seçeneklerden bul.",
  aciklama: "Resimden çıkan parçayı seçeneklerden bul.",
  ipucu: "Altındaki seçeneklerden doğru parçaya dokun",
  emoji: '🖼️',
  kategori: 'dikkat',
  etiketler: ['Dikkat', 'Gözlem'],
  renk: ['#38bdf8', '#0369a1'],
  tuval: { genislik: 510, yukseklik: 700, disPay: 250 },
  arayuz: {
    rozetler: [
      {
        etiket: "Tur",
        id: "round",
        baslangic: "1"
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
