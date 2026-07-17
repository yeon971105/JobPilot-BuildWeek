import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "local-ai-service/.venv/**",
    "local-ai-service/__pycache__/**",
    ".tmp-*",
    ".tmp-*.*",
    ".qa-*",
    ".qa-*.*",
    "tmp-*.js",
    "tmp-*.mjs",
    "tmp-*",
    "tmp-*.*",
    "tmp-*.js",
    "tmp-*.mjs",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
