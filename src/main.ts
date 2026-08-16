import './shared/base.css'
import './shared/katalog.css'

import { Yonlendirici } from './cekirdek/yonlendirici.ts'

/**
 * Sayfalar da tembel yüklenir: katalog açılırken Phaser indirilmez.
 * Oyun sayfası paketi Phaser'ı ve ortak oyun CSS'ini taşır.
 */
new Yonlendirici([
  {
    onek: '#/oyun/',
    ciz: async (id) => (await import('./sayfalar/OyunSayfasi.ts')).oyunSayfasi(id),
  },
  {
    onek: '#/yonetim',
    ciz: async () => (await import('./sayfalar/YonetimSayfasi.ts')).yonetimSayfasi(),
  },
  {
    onek: '',
    ciz: async () => (await import('./sayfalar/KatalogSayfasi.ts')).katalogSayfasi(),
  },
]).basla()
