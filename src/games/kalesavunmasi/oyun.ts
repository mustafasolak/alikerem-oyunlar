import { tanim } from '../../cekirdek/tanim.ts'
import { KALE_CANI, MALZEMELER, BASLANGIC_ALTIN } from './config/constants.ts'

/** Malzeme düğmeleri fiyatlarıyla birlikte tablodan üretilir; fiyat tek yerde durur. */
const malzemePaneli = `<div class="toolbar">${MALZEMELER.map(
  (m) =>
    `<button class="btn" type="button" data-malzeme="${m.id}" title="${m.ozet}">${m.etiket} · <b>${m.fiyat}</b></button>`,
).join('')}</div>`

export default tanim({
  id: 'kalesavunmasi',
  ad: 'Kale Savunması',
  ozet: 'Kaleye yürüyen canavarları mızrakla durdur.',
  aciklama: 'Dalga dalga gelen canavarları mızrakla vur, kaleyi ayakta tut.',
  ipucu:
    '<kbd>Boşluk</kbd> saldır · <kbd>↑</kbd><kbd>↓</kbd> nişan · <kbd>P</kbd> duraklat · ekrana dokun = mızrak at · <b>+</b> yuvasına dokun = kule kur, kuleye dokun = yükselt',
  emoji: '🏰',
  kategori: 'arcade',
  etiketler: ['Arcade', 'Nişan', 'Savunma'],
  renk: ['#f59e0b', '#7c2d12'],
  tuval: { genislik: 540, yukseklik: 400, disPay: 400 },
  arayuz: {
    rozetler: [
      { etiket: 'Dalga', id: 'wave', baslangic: 'Hazır' },
      { etiket: 'Kale', id: 'castle', baslangic: String(KALE_CANI) },
      { etiket: 'Altın', id: 'gold', baslangic: String(BASLANGIC_ALTIN) },
      { etiket: 'Süre', id: 'timer', baslangic: '0:00' },
    ],
    pad: [
      { etiket: '🗡 Saldır', deger: 'at' },
      { etiket: '⏸ Duraklat', deger: 'duraklat' },
    ],
    paneller: [{ id: 'malzeme', baslik: 'Malzeme dükkânı', ic: malzemePaneli }],
  },
  sahne: () => import('./scenes/GameScene.ts'),
})
