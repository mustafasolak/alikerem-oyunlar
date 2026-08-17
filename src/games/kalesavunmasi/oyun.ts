import { tanim } from '../../cekirdek/tanim.ts'
import { BASLANGIC_ALTIN, DUNYALAR, ELEMENT_ADI, ELEMENT_SIMGE, YUKSELTMELER } from './config/constants.ts'

/**
 * Yükseltme düğmeleri tablodan üretilir; fiyat ve seviye yazısını sahne
 * doldurur. Böylece fiyatlar tek yerde (sabitlerde) durur.
 */
const yukseltmePaneli = `<div class="toolbar">${YUKSELTMELER.map(
  (y) =>
    `<button class="btn" type="button" data-yukseltme="${y.id}" title="${y.ozet}">${y.etiket} · <b>${y.fiyat}</b></button>`,
).join('')}</div>`

export default tanim({
  id: 'kalesavunmasi',
  ad: 'Kale Savunması',
  ozet: 'Kaleye yürüyen canavarları mızrakla durdur.',
  aciklama: 'Dalga dalga gelen canavarları mızrakla vur, kaleyi ayakta tut.',
  ipucu:
    '<kbd>Boşluk</kbd> saldır · <kbd>↑</kbd><kbd>↓</kbd> nişan · <kbd>P</kbd> duraklat · <kbd>E</kbd> element değiştir · <b>+</b> yuvasına dokun = kule kur, kuleye dokun = yükselt · <b>uçan canavara mızrak değmez, yalnız kuleler vurur</b>',
  emoji: '🏰',
  kategori: 'arcade',
  etiketler: ['Arcade', 'Nişan', 'Savunma'],
  renk: ['#f59e0b', '#7c2d12'],
  tuval: { genislik: 540, yukseklik: 400, disPay: 470 },
  arayuz: {
    // Dünya seçimi: kilitli dünyanın düğmesi sahne tarafından kapatılır.
    aracCubugu: DUNYALAR.map((d, i) => ({ etiket: d.kisaAd, deger: String(i) })),
    rozetler: [
      { etiket: 'Dalga', id: 'wave', baslangic: 'Hazır' },
      { etiket: 'Kale', id: 'castle', baslangic: String(DUNYALAR[0].kaleCani) },
      { etiket: 'Altın', id: 'gold', baslangic: String(BASLANGIC_ALTIN) },
      { etiket: 'Süre', id: 'timer', baslangic: '0:00' },
    ],
    pad: [
      { etiket: '🗡 Saldır', deger: 'at' },
      { etiket: `${ELEMENT_SIMGE.normal} ${ELEMENT_ADI.normal}`, deger: 'element' },
      { etiket: '🤖 Otomatik', deger: 'otomatik' },
      { etiket: '⏸ Duraklat', deger: 'duraklat' },
    ],
    paneller: [{ id: 'malzeme', baslik: 'Yükseltme dükkânı', ic: yukseltmePaneli }],
  },
  sahne: () => import('./scenes/GameScene.ts'),
})
