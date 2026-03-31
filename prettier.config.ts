import type { Config } from "prettier";

const config: Config = {
  // Indentation
  useTabs: true,

  // Quotes
  singleQuote: false,
  jsxSingleQuote: false,

  // Semicolons
  semi: true,

  // Trailing commas
  trailingComma: "all",

  // Line length
  printWidth: 100,

  // JSX
  bracketSameLine: false, // puts `>` of multiline JSX on its own line

  // Arrows
  arrowParens: "always", // always wrap arrow fn params: (x) => x, not x => x
};

export default config;
