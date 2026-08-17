import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'game2048',
  ad: "2048",
  ozet: "Kareleri kaydır, aynı sayıları birleştir ve 2048 karesine ulaş.",
  aciklama: "Aynı sayıları birleştir, 2048 karesine ulaş.",
  ipucu: "<kbd>←</kbd> <kbd>↑</kbd> <kbd>→</kbd> <kbd>↓</kbd> veya <kbd>WASD</kbd> ile oyna · mobilde parmağını kaydır · <kbd>Z</kbd> ile son hamleyi geri al",
  emoji: '🔢',
  kategori: 'yerlestirme',
  etiketler: ['Bulmaca', 'Tek kişilik'],
  renk: ['#edc22e', '#f2b179'],
  tuval: { genislik: 510, yukseklik: 510, disPay: 296 },
  arayuz: {
    rozetler: [{ etiket: 'Geri alma', id: 'undo-left', baslangic: '3' }],
    pad: [{ etiket: '↩︎ Geri al', deger: 'geri' }],
  },
  sahne: () => import('./scenes/GameScene.ts'),
})
