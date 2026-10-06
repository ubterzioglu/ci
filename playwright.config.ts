import { defineConfig, devices } from '@playwright/test';

/**
 * E2E config. By default it builds and serves the production bundle on :3100.
 * Point `PLAYWRIGHT_BASE_URL` at a running site (dev server, staging) to skip that.
 */
const externalBaseUrl = process.env.PLAYWRIGHT_BASE_URL;
const PORT = 3100;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: externalBaseUrl ?? `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: externalBaseUrl
    ? undefined
    : {
        command: `pnpm build && pnpm exec next start -p ${PORT}`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: true,
        timeout: 300_000,
      },
});
