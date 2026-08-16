import { defineConfig } from 'vite'

/**
 * Tek sayfalı yapı: oyunlar `import.meta.glob` ile tembel yüklenir, Vite her
 * oyunu kendi parçasına böler. Oyun başına build girdisi tutmaya gerek yok.
 *
 * base:
 *  - Vercel'de site kökte durur → '/' (derin yollarda da varlıklar bulunur)
 *  - GitHub Pages'te alt klasörde durur → './' (göreli)
 * Vercel derlemede VERCEL=1 tanımlar; ikisi de çalışsın diye buna bakıyoruz.
 */
const vercelde = Boolean(process.env.VERCEL)

export default defineConfig({
  base: vercelde ? '/' : './',
  build: {
    // Phaser tek büyük parça; uyarı eşiğini gerçeğe yaklaştır
    chunkSizeWarningLimit: 1600,
  },
})
