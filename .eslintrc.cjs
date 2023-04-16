/** @type {import("eslint").Linter.Config} */
const config = {
  env: {
    browser: true,
    node: true,
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  overrides: [],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.base.json',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // I think there is currently no other primitive provided by TypeScript to
    // define namespaces in the world of type definitions, so namespace is irreplaceable.
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-empty-function': 'off',
  },
}

module.exports = config
