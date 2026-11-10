// Playwright config for the slides-commons site tests.
//   npm test                 (= playwright test -c tests)
// The web server builds site/ and serves it on TEST_PORT (default 4199).
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const PORT = Number(process.env.TEST_PORT) || 4199;
const node = JSON.stringify(process.execPath);

export default defineConfig({
  testDir: HERE,
  testMatch: /.*\.spec\.mjs$/,
  outputDir: path.join(HERE, 'test-results'),
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 2,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: `http://127.0.0.1:${PORT}/`,
    trace: 'retain-on-failure',
  },
  projects: [
    // Runs first: rebuilds site/ from a clean state (the server reads files per request).
    { name: 'build', testMatch: /build\.setup\.mjs$/, use: { ...devices['Desktop Chrome'] } },
    {
      name: 'chromium',
      dependencies: ['build'],
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
  ],
  webServer: {
    // Build once so the server has something to serve, then serve.
    command: `${node} scripts/build.mjs && ${node} scripts/serve.mjs`,
    cwd: ROOT,
    env: { PORT: String(PORT) },
    url: `http://127.0.0.1:${PORT}/index.html`,
    reuseExistingServer: false,
    timeout: 60_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
