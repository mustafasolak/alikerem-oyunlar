import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'sifre',
  ad: "Şifre Çözme",
  ozet: "Sayıların arkasındaki gizli kelimeyi çöz.",
  aciklama: "Her harfin hangi sayı olduğunu bul.",
  ipucu: "Sayıya dokun, sonra harfi seç · ipuçlarını kullan",
  emoji: '🔐',
  kategori: 'kelime',
  etiketler: ['Mantık', 'Kelime'],
  renk: ['#a78bfa', '#5b21b6'],
  tuval: { genislik: 510, yukseklik: 550, disPay: 330 },
  arayuz: {
    rozetler: [
      {
        etiket: "Kalan",
        id: "remaining",
        baslangic: "0"
      },
      {
        etiket: "Hata",
        id: "mistakes",
        baslangic: "0"
      }
    ],
    tusTakimi: true
  },
  sahne: () => import('./scenes/GameScene.ts'),
})
