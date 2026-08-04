// .eslintrc.cjs
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  env: { browser: true, es2021: true, node: true },
  settings: { react: { version: 'detect' } },
  rules: {
    // Add any project‑specific overrides here
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-explicit-any': 'warn'
  }
};
