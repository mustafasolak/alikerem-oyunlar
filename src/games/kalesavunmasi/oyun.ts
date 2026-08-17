import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'kalesavunmasi',
  ad: 'Kale Savunması',
  ozet: 'Kaleye yürüyen canavarları mızrakla durdur.',
  aciklama: 'Dalga dalga gelen canavarları mızrakla vur, kaleyi ayakta tut.',
  ipucu: '<kbd>Boşluk</kbd> saldır · <kbd>↑</kbd><kbd>↓</kbd> nişan · dokunmatikte ekrana dokun',
  emoji: '🏰',
  kategori: 'arcade',
  etiketler: ['Arcade', 'Nişan', 'Savunma'],
  renk: ['#f59e0b', '#7c2d12'],
  tuval: { genislik: 540, yukseklik: 400, disPay: 290 },
  arayuz: {
    rozetler: [
      { etiket: 'Dalga', id: 'wave', baslangic: 'Hazır' },
      { etiket: 'Kale', id: 'castle', baslangic: '30' },
      { etiket: 'Süre', id: 'timer', baslangic: '0:00' },
    ],
    pad: [{ etiket: '🗡 Saldır', deger: 'at' }],
  },
  sahne: () => import('./scenes/GameScene.ts'),
})
