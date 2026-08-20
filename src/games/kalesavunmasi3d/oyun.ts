import { tanim } from '../../cekirdek/tanim.ts'
import {
  BASLANGIC_ALTIN,
  DUNYALAR,
  ELEMENT_ADI,
  ELEMENT_SIMGE,
  KULE_TIPLERI,
  VARSAYILAN_ZORLUK,
  YUKSELTMELER,
  ZORLUKLAR,
} from '../kalesavunmasi/config/constants.ts'

/**
 * Paneller katlanabilir: telefonda tahtaya yer kalsın diye kapalı başlar,
 * sahne geniş ekranda kendiliğinden açar.
 */
const katlanir = (ozet: string, ic: string): string =>
  `<details class="katlanir"><summary>${ozet}</summary>${ic}</details>`

/**
 * Kule paneli. Üç boyutlu sahnede menüyü tuvale çizmek yerine sayfada tutuyoruz:
 * yazı keskin kalıyor, dokunma hedefi büyük oluyor. Yuvaya sahnede dokunmak da
 * aynı seçimi yapar.
 */
const kulePaneli = katlanir(
  `${KULE_TIPLERI.length} kule tipi`,
  `<div class="toolbar">${KULE_TIPLERI.map(
     (k, i) =>
       `<button class="btn" type="button" data-kule="${i}" title="${k.ozet}">${k.ad.replace(' Kulesi', '')} · <b>${k.fiyat[0]}</b></button>`,
   ).join('')}
     <button class="btn" type="button" data-kule="yukselt">⬆ Yükselt · <b>—</b></button>
     <button class="btn" type="button" data-kule="yik">⛏ Yık · <b>—</b></button>
   </div>`,
)

const yukseltmePaneli = katlanir(
  `${YUKSELTMELER.length} yükseltme`,
  `<div class="toolbar">${YUKSELTMELER.map(
    (y) =>
      `<button class="btn" type="button" data-yukseltme="${y.id}" title="${y.ozet}">${y.etiket} · <b>${y.fiyat}</b></button>`,
  ).join('')}</div>`,
)

const dunyaPaneli = katlanir(
  DUNYALAR.map((d) => d.kisaAd).join(' · '),
  `<div class="toolbar">${DUNYALAR.map(
    (d, i) => `<button class="btn" type="button" data-dunya="${i}">${d.kisaAd}</button>`,
  ).join('')}</div>`,
)

export default tanim({
  id: 'kalesavunmasi3d',
  ad: 'Kale Savunması 3B',
  ozet: 'Aynı kale, bu kez üç boyutlu bir sahada.',
  aciklama: 'Yoldan gelen canavarları mızrakla vur, kule kur, kaleyi ayakta tut.',
  ipucu:
    '<b>Nereye dokunursan mızrak oraya gider</b> · <b>sürükle</b> kamerayı çevirir · <kbd>Boşluk</kbd> saldır · <kbd>↑</kbd><kbd>↓</kbd> nişan · <kbd>P</kbd> duraklat · <kbd>E</kbd> element · <kbd>C</kbd> kamera açısı · <kbd>M</kbd> ya da sağ üstteki <b>☰</b> dükkân (açıkken oyun durur) · <b>Yol kenarındaki çime dokun</b>, açılan menüden kule kur; kuleye dokununca yükselt/yık · <b>uçan canavara mızrak değmez, yalnız kuleler vurur</b>',
  emoji: '🏯',
  kategori: 'arcade',
  etiketler: ['Arcade', '3B', 'Savunma'],
  renk: ['#f59e0b', '#1e3a8a'],
  motor: 'ucboyut',
  tuval: { genislik: 840, yukseklik: 430, disPay: 390 },
  arayuz: {
    aracCubugu: ZORLUKLAR.map((z) => ({ etiket: z.ad, deger: z.id })),
    rozetler: [
      { etiket: 'Dalga', id: 'wave', baslangic: 'Hazır' },
      {
        etiket: 'Kale',
        id: 'castle',
        baslangic: String(Math.round(DUNYALAR[0].kaleCani * ZORLUKLAR[VARSAYILAN_ZORLUK].kaleCarpani)),
      },
      { etiket: 'Altın', id: 'gold', baslangic: String(BASLANGIC_ALTIN) },
      { etiket: 'Süre', id: 'timer', baslangic: '0:00' },
    ],
    pad: [
      { etiket: '🗡 Saldır', deger: 'at' },
      { etiket: `${ELEMENT_SIMGE.normal} ${ELEMENT_ADI.normal}`, deger: 'element' },
      { etiket: '🤖 Otomatik', deger: 'otomatik' },
      { etiket: '🎥 Kamera', deger: 'kamera' },
      { etiket: '⏸ Duraklat', deger: 'duraklat' },
    ],
    paneller: [
      { id: 'kule', baslik: 'Kuleler', ic: kulePaneli },
      { id: 'dunya', baslik: 'Dünya', ic: dunyaPaneli },
      { id: 'malzeme', baslik: 'Yükseltme dükkânı', ic: yukseltmePaneli },
    ],
  },
  sahne: () => import('./scenes/GameScene.ts'),
})
