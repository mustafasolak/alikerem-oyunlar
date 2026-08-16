import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'asmaca',
  ad: "Adam Asmaca",
  ozet: "Harf tahmin et, altı hakkın bitmeden kelimeyi çöz.",
  aciklama: "Harfleri tahmin et, altı hakkın bitmeden kelimeyi çöz.",
  ipucu: "Harfe dokun ya da klavyeden bas · her yanlış tahmin bir hak götürür",
  emoji: '🪢',
  kategori: 'kelime',
  etiketler: ['Kelime', 'Tahmin'],
  renk: ['#fbbf24', '#b45309'],
  tuval: { genislik: 510, yukseklik: 560, disPay: 375 },
  arayuz: {
    rozetler: [
      {
        etiket: "Kalan hak",
        id: "lives",
        baslangic: "6"
      },
      {
        etiket: "İpucu",
        id: "category",
        baslangic: "—"
      }
    ],
    tusTakimi: true
  },
  sahne: () => import('./scenes/GameScene.ts'),
})
