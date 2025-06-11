import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      // Generated Prisma files
      "src/generated/**/*",
      "src/generated/prisma/runtime/**/*",
      "src/generated/prisma/wasm.js",
      
      // Build outputs
      ".next/**/*",
      "out/**/*",
      "dist/**/*",
      "build/**/*",
      
      // Dependencies
      "node_modules/**/*",
      "**/node_modules/**/*",
      
      // Cache
      ".eslintcache",
      
      // Generated and minified files
      "*.min.js",
      "*.min.ts",
      "*.min.tsx",
      "*.bundle.js",
      "*.bundle.ts",
      "*.bundle.tsx",
      
      // Coverage
      "coverage/**/*",
      
      // Test files
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx",
      // Ignore type declaration file with unused types
      "src/types/youtube-transcript-api.d.ts"
    ]
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
