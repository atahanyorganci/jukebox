module.exports = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: {
            jsx: true,
        },
    },
    env: {
        jest: true,
    },
    settings: {},
    extends: [
        "plugin:@typescript-eslint/recommended",
        "prettier/@typescript-eslint",
        "plugin:prettier/recommended",
    ],
    rules: {
        "no-console": "warn",
        "no-eval": "error",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "no-unused-vars": ["off"],
        "@typescript-eslint/no-unused-vars": [
            "error",
            { vars: "all", varsIgnorePattern: "^_" },
        ],
    },
};
