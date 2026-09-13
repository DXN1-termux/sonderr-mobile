import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import reactNative from "eslint-plugin-react-native";
import react from "@eslint-react/eslint-plugin";

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      "react-native": reactNative,
      "@eslint-react": react,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      "react-native/no-unused-styles": "warn",
      "react-native/no-inline-styles": "warn",
      "react-native/no-color-literals": "off",
    },
  },
  {
    ignores: ["node_modules/**", "dist/**", ".expo/**"],
  },
];
