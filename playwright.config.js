import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  // Tests share an in-memory server, so run them in file order to avoid cross-test pollution.
  fullyParallel: false,
  // Fail the build on CI if you accidentally left test.only in the source.
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",

  use: {
    baseURL: "http://localhost:3000",
    // Capture trace on the first retry of a failed test — open with:
    // npx playwright show-trace trace.zip
    trace: "on-first-retry",
  },

  projects: [
    // Run against Chromium by default. Add Firefox/WebKit as needed.
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],

  // Automatically start the dev server before running tests.
  // `reuseExistingServer` lets you run `npm run dev` yourself during active
  // development so tests reuse the already-running process.
  webServer: {
    command: "node server.js",
    url: "http://localhost:3000/health",
    reuseExistingServer: !process.env.CI,
    env: {
      NODE_ENV: "development",
      SESSION_SECRET: "playwright-test-secret-long-enough",
      CSRF_SECRET: "playwright-csrf-secret-long-enough",
      PORT: "3000",
      APP_NAME: "Boilerplate",
    },
  },
});
