import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const srcDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": srcDir,
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["src/vitest.setup.ts"],
    globals: true,
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["**/e2e/**", "**/node_modules/**", "**/dist/**"],
  },
});