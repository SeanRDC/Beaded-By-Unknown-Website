import { defineConfig } from '@playwright/test';

/* Runs against a throwaway API with an in-memory database. See beaded-backend/scripts/dev-server.js. */
export default defineConfig({
  testDir: 'e2e',
  timeout: 45000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173',
    channel: 'chrome',
    trace: 'retain-on-failure'
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'phone', use: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } }
  ],
  webServer: [
    {
      command: 'node scripts/dev-server.js',
      cwd: '../beaded-backend',
      url: 'http://localhost:4599/api/health',
      reuseExistingServer: true
    },
    {
      command: 'npm run build && npx vite preview --port 5173 --strictPort',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      env: { VITE_API_URL: 'http://localhost:4599' }
    }
  ]
});
