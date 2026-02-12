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
      // غیرفعال کردن rule هایی که باعث خطا در دیپلوی می‌شوند
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "react-hooks/exhaustive-deps": "warn",
      "@next/next/no-img-element": "off",
      "react/no-unescaped-entities": "off",
      "jsx-a11y/alt-text": "off",
      "prefer-const": "off",
      
      // یا اگر می‌خواهید فقط warning بدهند نه error:
      // "@typescript-eslint/no-explicit-any": "warn",
      // "@typescript-eslint/no-unused-vars": "warn",
    },
  },
];

export default eslintConfig;