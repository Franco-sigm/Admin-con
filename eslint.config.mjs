import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
    rules: {
      "semi": ["error", "always"],        // Obliga a usar punto y coma
      "quotes": ["error", "double"],      // Obliga a usar comillas dobles
      "no-unused-vars": "warn",           // Advierte variables no usadas
      "no-console": "warn"                // Marca console.log como advertencia
    }
  },
]);
