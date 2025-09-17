import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // Disallow console logs in production
      "no-console": process.env.NODE_ENV === "production" ? "error" : "warn",
      // Allow console.error and console.warn in production for error handling
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.object.name='console'][callee.property.name!=/^(error|warn)$/]",
          message: "Unexpected console statement. Use console.error() or console.warn() for production logging.",
        },
      ],
    },
  },
];

export default eslintConfig;
