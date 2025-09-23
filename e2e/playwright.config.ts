import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  reporter: 'dot',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    launchOptions: {
      slowMo: 1000,
    },
    headless: true,
    trace: 'off',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});


