import { defineConfig } from "vitest/config";
import path from "node:path";

/**
 * Integration suite — hits the real ZizkaDB API (cloud by default, using
 * .env.local's ZIZKADB_API_KEY/ZIZKADB_AGENT_NAME) through our actual
 * src/zizkadb/* service layer, not mocks. Separate from vitest.config.ts so
 * `npm test` stays fast/offline; run this with `npm run test:integration`.
 *
 * `resolve.conditions: ["react-server"]` makes the "server-only" package
 * resolve to its no-op export (same condition Next.js's server bundle sets)
 * so src/zizkadb/client.ts and friends can be imported directly under Node.
 */
export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/zizkadb/integration/**/*.test.ts"],
    setupFiles: ["./src/zizkadb/integration/setup.ts"],
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
  resolve: {
    conditions: ["react-server"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
