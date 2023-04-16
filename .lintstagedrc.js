const path = require('path')

const buildEslintCommand = filenames =>
  `yarn eslint --fix ${filenames.map(f => path.relative(process.cwd(), f)).join(' ')}`

module.exports = {
  '*.{js,cjs,mjs,jsx,ts,tsx}': ['prettier --write', buildEslintCommand],
  // TODO: add `stylelint --fix`
  '*.{css,scss}': ['prettier --write'],
}
