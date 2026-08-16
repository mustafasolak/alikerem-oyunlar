import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'sudoku',
  ad: "Sudoku",
  ozet: "Her satır, sütun ve kutuda 1-9 bir kez geçsin.",
  aciklama: "Her satır, sütun ve 3×3 kutuda 1-9 birer kez geçsin.",
  ipucu: "Kareye dokun, sonra rakam seç · <kbd>1</kbd>-<kbd>9</kbd> yazabilir, <kbd>Sil</kbd> ile silebilirsin",
  emoji: '🧮',
  kategori: 'mantik',
  etiketler: ['Mantık', 'Üç zorluk'],
  renk: ['#60a5fa', '#1d4ed8'],
  tuval: { genislik: 510, yukseklik: 510, disPay: 335 },
  arayuz: {
    rozetler: [
      {
        etiket: "Süre",
        id: "timer",
        baslangic: "0"
      },
      {
        etiket: "Hata",
        id: "mistakes",
        baslangic: "0"
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
    ],
    tusTakimi: true
  },
  sahne: () => import('./scenes/GameScene.ts'),
})
