import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'mastermind',
  ad: "Mastermind",
  ozet: "Gizli renk dizisini ipuçlarıyla adım adım çöz.",
  aciklama: "Gizli renk dizisini ipuçlarına bakarak çöz.",
  ipucu: "Alttaki renklere dokunup sırayı doldur · ● doğru yerde, ○ renk var ama yeri yanlış",
  emoji: '🎯',
  kategori: 'mantik',
  etiketler: ['Mantık', 'Tahmin'],
  renk: ['#f472b6', '#9d174d'],
  tuval: { genislik: 460, yukseklik: 560, disPay: 250 },
  arayuz: {
    rozetler: [
      {
        etiket: "Kalan hak",
        id: "tries",
        baslangic: "10"
      }
    ]
  },
  sahne: () => import('./scenes/GameScene.ts'),
})
