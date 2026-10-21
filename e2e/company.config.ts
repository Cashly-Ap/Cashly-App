import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: '.',
  testMatch: 'company.spec.ts',
  workers: 1,
  reporter: 'line',
  outputDir: '../output/playwright/company/results',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: process.env['PLAYWRIGHT_BASE_URL'] ?? 'http://127.0.0.1:4200',
    launchOptions: {
      executablePath: process.env['PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH'],
      args: ['--no-sandbox'],
    },
    screenshot: 'only-on-failure',
  },
});
