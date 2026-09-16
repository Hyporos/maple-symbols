import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";

export default tseslint.config(
  {
    // This replaces .eslintignore
    ignores: ["dist", "node_modules", "public"],
  },

  // Base JS and TS recommended configs
  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // Pull in the recommended hooks rules manually since the plugin
      // is still bridging to the new Flat Config format
      ...reactHooks.configs.recommended.rules,

      // react-hooks v7 introduced strict new rules that are too aggressive for
      // existing patterns (accumulator vars in render, intentional setState in
      // effects, @floating-ui ref passing). Turn off and revisit per-rule.
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/immutability": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",

      // Context + Tooltip files intentionally export both a Provider component
      // and a hook — this is not a fast-refresh concern.
      "react-refresh/only-export-components": "off",

      // Allow ternary/short-circuit expressions used as statements
      // (common pattern: condition ? sideEffectA() : sideEffectB())
      "@typescript-eslint/no-unused-expressions": [
        "error",
        { allowTernary: true, allowShortCircuit: true },
      ],

      // Honour the `_` prefix convention for intentionally unused args/vars
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      // `any` is occasionally needed in third-party-interop code
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },

  // Prettier must be last
  prettierRecommended
);
