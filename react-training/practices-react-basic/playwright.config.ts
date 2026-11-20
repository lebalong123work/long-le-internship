import { defineConfig, devices } from '@playwright/test'

const E2E_API_PORT = 3101
const E2E_APP_PORT = 5181
const E2E_DB = 'server/db.e2e.json'
const APP_URL = `http://localhost:${E2E_APP_PORT}`
const API_URL = `http://localhost:${E2E_API_PORT}`

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: true,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  outputDir: 'test-results',
  use: {
    baseURL: APP_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: `node server/ensure-db.mjs --db ${E2E_DB} --reset && node server/start.mjs ${E2E_DB} --port ${E2E_API_PORT}`,
      url: `${API_URL}/products`,
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      command: `npx vite --port ${E2E_APP_PORT} --strictPort`,
      url: APP_URL,
      reuseExistingServer: false,
      timeout: 60_000,
      env: { VITE_API_URL: API_URL, VITE_API_DELAY_MS: '0' },
    },
  ],
})
