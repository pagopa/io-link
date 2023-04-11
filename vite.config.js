import { defineConfig, configDefaults } from "vitest/config";

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, "lib/**"],
    coverage: {
      exclude: ["**/__test__/**", ".pnp.cjs", ".pnp.loader.mjs"],
    },
  },
});
