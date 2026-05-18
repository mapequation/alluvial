/// <reference types="vitest/config" />
import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";

const config: UserConfig & {
  test?: { environment: string; globals: boolean; setupFiles: string[], include: string[]; exclude: string[] };
} = {
  plugins: [react()],
  base: "/alluvial/",
  build: {
    outDir: "build",
    sourcemap: true,
  },
  server: {
    open: true,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    // Vitest runs unit/component tests in src/. Playwright owns e2e/.
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "build", "e2e"],
  },
};

export default defineConfig(config);
