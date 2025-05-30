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
    rules: {
      // غیرفعال کردن قوانین hooks برای فایل‌های خاص
      "react-hooks/rules-of-hooks": "off",
      "react-hooks/exhaustive-deps": "warn",

      // سخت‌گیری برای type any و unused variables
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "error",

      // سایر قوانین
      "@next/next/no-img-element": "warn",
      "jsx-a11y/alt-text": "warn",
      "@typescript-eslint/no-non-null-asserted-optional-chain": "warn",
      "no-console": "warn",
    },
  },
];

export default eslintConfig;
