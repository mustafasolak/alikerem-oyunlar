import { tanim } from '../../cekirdek/tanim.ts'
import {
  BASLANGIC_ALTIN,
  DUNYALAR,
  ELEMENT_ADI,
  ELEMENT_SIMGE,
  VARSAYILAN_ZORLUK,
  YUKSELTMELER,
  ZORLUKLAR,
} from './config/constants.ts'

/**
 * Paneller katlanabilir.
 *
 * Zorluk çubuğu, rozetler, dükkân ve tuş takımı birikince telefonda tahtaya
 * yer kalmıyordu (198px'e kadar düşüyordu). `details` ile kapalı duruyorlar;
 * sahne geniş ekranda kendiliğinden açıyor.
 */
const katlanir = (ozet: string, ic: string): string =>
  `<details class="katlanir"><summary>${ozet}</summary>${ic}</details>`

const yukseltmePaneli = katlanir(
  `${YUKSELTMELER.length} yükseltme`,
  `<div class="toolbar">${YUKSELTMELER.map(
    (y) =>
      `<button class="btn" type="button" data-yukseltme="${y.id}" title="${y.ozet}">${y.etiket} · <b>${y.fiyat}</b></button>`,
  ).join('')}</div>`,
)

/** Dünya seçimi: kilitli olanı sahne kapatır ve kalan sayıyı yazar. */
const dunyaPaneli = katlanir(
  DUNYALAR.map((d) => d.kisaAd).join(' · '),
  `<div class="toolbar">${DUNYALAR.map(
    (d, i) => `<button class="btn" type="button" data-dunya="${i}">${d.kisaAd}</button>`,
  ).join('')}</div>`,
)

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
  tuval: { genislik: 720, yukseklik: 430, disPay: 400 },
  arayuz: {
    // Zorluk üstte: sitedeki diğer oyunlarda da bu yerde duruyor.
    aracCubugu: ZORLUKLAR.map((z) => ({ etiket: z.ad, deger: z.id })),
    rozetler: [
      { etiket: 'Dalga', id: 'wave', baslangic: 'Hazır' },
      { etiket: 'Kale', id: 'castle', baslangic: String(Math.round(DUNYALAR[0].kaleCani * ZORLUKLAR[VARSAYILAN_ZORLUK].kaleCarpani)) },
      { etiket: 'Altın', id: 'gold', baslangic: String(BASLANGIC_ALTIN) },
      { etiket: 'Süre', id: 'timer', baslangic: '0:00' },
    ],
    pad: [
      { etiket: '🗡 Saldır', deger: 'at' },
      { etiket: `${ELEMENT_SIMGE.normal} ${ELEMENT_ADI.normal}`, deger: 'element' },
      { etiket: '🤖 Otomatik', deger: 'otomatik' },
      { etiket: '⏸ Duraklat', deger: 'duraklat' },
    ],
    paneller: [
      { id: 'dunya', baslik: 'Dünya', ic: dunyaPaneli },
      { id: 'malzeme', baslik: 'Yükseltme dükkânı', ic: yukseltmePaneli },
    ],
  },
  sahne: () => import('./scenes/GameScene.ts'),
})
