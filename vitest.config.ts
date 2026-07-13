import { defineConfig, configDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    // Integration tests hit the real ZizkaDB API — run separately via
    // `npm run test:integration` (vitest.integration.config.ts), not here.
    exclude: [...configDefaults.exclude, "src/zizkadb/integration/**"],
    env: {
      NEXT_PUBLIC_API_URL: "http://localhost:8000",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
