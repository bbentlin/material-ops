import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: false,
    env: {
      NEXT_PUBLIC_E2E_CRASH: "1",
      E2E_CRASH: "1",
      E2E_DISABLE_RATE_LIMITS: "1",
    },
  },
});