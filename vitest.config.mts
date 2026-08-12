import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';
import { fileURLToPath } from 'node:url';

const sourceRoot = fileURLToPath(new URL('./src', import.meta.url));

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
      '@app': `${sourceRoot}/app`,
      '@shared': `${sourceRoot}/app/shared`,
      '@core': `${sourceRoot}/app/core`,
      '@env': `${sourceRoot}/environments`,
      '@features': `${sourceRoot}/app/features`,
    },
    dedupe: ['@angular/core', '@angular/common', 'primeng'],
  },
});
