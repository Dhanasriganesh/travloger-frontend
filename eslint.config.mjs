import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    { ignores: [".next/*", "node_modules/*"] },
    ...compat.extends("next/core-web-vitals", "next/typescript"),
    {
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/ban-ts-comment": "off",
            "react-hooks/exhaustive-deps": "off",
            "@next/next/no-img-element": "off",
            "@typescript-eslint/no-empty-interface": "off",
            "@typescript-eslint/no-empty-object-type": "off",
            "react/no-unescaped-entities": "off",
            "prefer-const": "off",
            "@typescript-eslint/no-require-imports": "off",
            "@typescript-eslint/no-non-null-asserted-optional-chain": "off"
        },
    },
];

export default eslintConfig;
