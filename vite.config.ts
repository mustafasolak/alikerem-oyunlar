import { defineConfig } from 'vite'

/** Proje köküne göre mutlak dosya yolu (Node tiplerine ihtiyaç duymadan). */
const fromRoot = (path: string) => new URL(path, import.meta.url).pathname

// Çok sayfalı site: kökte ana sayfa, her oyun kendi klasöründe bir HTML sayfası.
// Yeni oyun eklerken: games/<oyun>/index.html oluştur ve buraya bir girdi ekle.
export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        home: fromRoot('index.html'),
        game2048: fromRoot('games/2048/index.html'),
        yilan: fromRoot('games/yilan/index.html'),
      },
    },
  },
})
