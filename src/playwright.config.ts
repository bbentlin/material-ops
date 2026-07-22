import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

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
      DATABASE_URL: process.env.DATABASE_URL!,  // ← add this line
      JWT_SECRET: process.env.JWT_SECRET!,       // ← and this
    },
  },
});