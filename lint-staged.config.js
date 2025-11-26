module.exports = {
  // TypeScript: run ESLint + Prettier
  'src/**/*.ts': [
    'eslint --fix',
    'prettier --write'
  ],
  // Templates and styles: Prettier only (no ESLint)
  'src/**/*.{html,scss}': [
    'prettier --write'
  ]
};
