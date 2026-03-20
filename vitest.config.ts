import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./tests/vitest.setup.ts"],
    include: ["tests/**/*.test.ts"],
    // Evita colisões no banco entre testes de integração.
    maxConcurrency: 1,
    coverage: {
      provider: "v8",
      all: true,
      reportOnFailure: true,
      reporter: ["text", "html"],
      reportsDirectory: "./coverage",
      // Requisito do trabalho: cobertura mínima de 80%.
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
      exclude: ["src/**/entities/**", "src/**/routes/**", "src/**/database/**"]
    }
  }
});

