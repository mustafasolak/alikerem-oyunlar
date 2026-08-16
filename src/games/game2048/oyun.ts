import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'game2048',
  ad: "2048",
  ozet: "Kareleri kaydır, aynı sayıları birleştir ve 2048 karesine ulaş.",
  aciklama: "Aynı sayıları birleştir, <strong>2048</strong> karesine ulaş.",
  ipucu: "<kbd>←</kbd> <kbd>↑</kbd> <kbd>→</kbd> <kbd>↓</kbd> veya <kbd>WASD</kbd> ile oyna · mobilde parmağını kaydır",
  emoji: '🔢',
  kategori: 'yerlestirme',
  etiketler: ['Bulmaca', 'Tek kişilik'],
  renk: ['#edc22e', '#f2b179'],
  tuval: { genislik: 510, yukseklik: 510, disPay: 215 },
  sahne: () => import('./scenes/GameScene.ts'),
})
