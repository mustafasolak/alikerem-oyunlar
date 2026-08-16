import { defineConfig } from 'vite'

/**
 * Tek sayfalı yapı: oyunlar `import.meta.glob` ile tembel yüklenir, Vite her
 * oyunu kendi parçasına böler. Oyun başına build girdisi tutmaya gerek yok.
 *
 * base: './' — alt klasörde barındırmada da çalışsın diye.
 */
export default defineConfig({
  base: './',
})
