import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { outputFolder: 'output/playwright/report', open: 'never' }]],
  outputDir: 'output/playwright/test-results',
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    locale: 'ko-KR',
  },
  projects: [
    {
      name: 'mobile',
      testMatch: /mobile-.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:8081',
        channel: process.env.CI ? undefined : 'chrome',
      },
    },
    {
      name: 'admin',
      testMatch: /admin-.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:3000',
        channel: process.env.CI ? undefined : 'chrome',
      },
    },
  ],
});
