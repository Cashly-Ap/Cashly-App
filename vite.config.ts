import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    include: ['chart.js/auto', 'primeng/tabs'],
  },
  ssr: {
    noExternal: ['chart.js', 'primeng'],
  },
  resolve: {
    dedupe: ['@angular/core', '@angular/common', 'primeng'],
  },
});
