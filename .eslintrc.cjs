/** @type {import("eslint").Linter.Config} */
const config = {
  env: {
    browser: true,
    node: true,
  },
  extends: ['eslint:recommended', 'prettier', 'plugin:@typescript-eslint/recommended'],
  overrides: [],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.base.json',
  },
  plugins: ['@typescript-eslint', 'import'],
  rules: {
    // I think there is currently no other primitive provided by TypeScript to
    // define namespaces in the world of type definitions, so namespace is irreplaceable.
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-empty-function': 'off',

    // A named export makes more sense.
    'import/no-default-export': 'error',

    'import/order': ['error', { groups: [['builtin', 'external', 'internal']] }],
    'import/newline-after-import': 'error',
  },
}

module.exports = config
