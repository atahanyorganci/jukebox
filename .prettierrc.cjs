/** @type {import("prettier").Config} */
const config = {
    semi: true,
    tabWidth: 4,
    printWidth: 100,
    arrowParens: "avoid",
    trailingComma: "es5",
    organizeImportsSkipDestructiveCodeActions: true,
    plugins: ["prettier-plugin-organize-imports"],
};

module.exports = config;
