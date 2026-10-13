import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'design.spec.ts',
  workers: 2,
  reporter: 'line',
  outputDir: '../output/design/results',
  use: {
    baseURL: process.env['DESIGN_BASE_URL'] ?? 'http://127.0.0.1:4202',
    browserName: 'chromium',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
});
