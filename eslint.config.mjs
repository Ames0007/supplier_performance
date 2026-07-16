import js from "@eslint/js";
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";
import globals from "globals";

export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "dist/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "next-env.d.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { "@next/next": nextPlugin },
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      // Constraint: strict TypeScript, no `any`.
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // DDD boundary (ARCHITECTURE_BLUEPRINT §DDD): cross-domain imports MUST go
      // through the feature public barrel `@/features/<domain>` only — never reach
      // into a domain's internal folders. A deliberate cross-import fails CI.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*/*"],
              message:
                "Cross-domain import must use the feature public barrel: import from '@/features/<domain>' only (ARCHITECTURE_BLUEPRINT DDD boundary).",
            },
          ],
        },
      ],
    },
  },
  // Feature-internal files may import their own siblings via relative paths;
  // the boundary rule targets `@/features/*` deep imports (cross-domain) only.
);
