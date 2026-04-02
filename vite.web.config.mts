import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

// https://vitejs.dev/config
export default defineConfig({
  plugins: [vue()],
  base: './',
  publicDir: 'public',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/renderer'),
    },
  },
  optimizeDeps: {
    include: ['simple-mind-map'],
  },
  build: {
    outDir: 'dist-web',
    emptyOutDir: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      input: resolve(__dirname, 'index.web.html'),
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
});
