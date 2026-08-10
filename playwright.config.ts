import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://localhost:3101', ...devices['Desktop Chrome'] },
  webServer: { command: 'npm run dev -- --port 3101', url: 'http://localhost:3101', reuseExistingServer: false },
});
