module.exports = {
  trailingComma: 'none',
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  printWidth: 115,
  endOfLine: 'lf',
  htmlWhitespaceSensitivity: 'ignore',
  arrowParens: 'avoid',
  bracketSpacing: true,
  overrides: [
    {
      files: '**/*.handlebars',
      options: { parser: 'html' }
    }
  ]
}
