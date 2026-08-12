import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular({})],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    pool: 'forks',
    poolOptions: {
      forks: {
        maxForks: 2,
        minForks: 1,
      },
    },
    browser: {
      enabled: false,
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test-setup.ts',
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/index.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@app': '/src/app',
      '@shared': '/src/app/shared',
      '@theme': '/src/app/theme',
      '@core': '/src/app/core',
      '@env': '/src/environments',
      '@environments': '/src/environments',
      '@features': '/src/app/features',
    },
    dedupe: ['@angular/core', '@angular/common', 'primeng'],
  },
});
