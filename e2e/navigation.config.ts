import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'navigation.spec.ts',
  workers: 1,
  reporter: 'line',
  outputDir: '../output/design/navigation-results',
  use: {
    baseURL: process.env['DESIGN_BASE_URL'] ?? 'http://127.0.0.1:4202',
    browserName: 'chromium',
    viewport: { width: 1920, height: 1080 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
});
