import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'yilan',
  ad: "Yılan",
  ozet: "Yem topla, uzadıkça hızlan. Duvara ve kuyruğuna çarpma.",
  aciklama: "Yem topla, duvara ve kendi kuyruğuna çarpma.",
  ipucu: "<kbd>←</kbd> <kbd>↑</kbd> <kbd>→</kbd> <kbd>↓</kbd> veya <kbd>WASD</kbd> ile yön ver · <kbd>Boşluk</kbd> duraklatır · mobilde parmağını kaydır",
  emoji: '🐍',
  kategori: 'arcade',
  etiketler: ['Arcade', 'Refleks'],
  renk: ['#bef264', '#4d7c0f'],
  tuval: { genislik: 510, yukseklik: 510, disPay: 215 },
  sahne: () => import('./scenes/GameScene.ts'),
})
