module.exports = {
  plugins: [require.resolve("@trivago/prettier-plugin-sort-imports")],
  singleQuote: false,
  trailingComma: "all",
  printWidth: 100,
  importOrder: ["^[./]"],
  importOrderSeparation: true,
  importOrderParserPlugins: ["typescript", "decorators-legacy"],
};
