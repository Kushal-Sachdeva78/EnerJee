import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    root: ".",
    include: ["**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
});
