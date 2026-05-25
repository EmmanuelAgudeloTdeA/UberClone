const { FlatCompat } = require('@eslint/eslintrc');
const path = require('path');

const compat = new FlatCompat({ baseDirectory: __dirname });

module.exports = [
  ...compat.extends(
    'airbnb',
    'airbnb-typescript',
    'airbnb/hooks',
    'prettier',
  ),
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: path.resolve(__dirname, './tsconfig.json'),
      },
    },
    rules: {
      // React 17+ new JSX transform — no need to import React in every file
      'react/react-in-jsx-scope': 'off',
      // Only .tsx files contain JSX in this project
      'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
      // TypeScript handles prop validation
      'react/prop-types': 'off',
      // Module resolution handles extensions
      'import/extensions': 'off',
      // Prefer @typescript-eslint version
      'no-use-before-define': 'off',
      '@typescript-eslint/no-use-before-define': ['error'],
      // Allow devDependencies in config files
      'import/no-extraneous-dependencies': [
        'error',
        { devDependencies: ['**/*.config.*', '**/*.test.*', '**/*.spec.*'] },
      ],
    },
  },
  {
    ignores: ['node_modules/**', '.expo/**', 'dist/**', 'scripts/**'],
  },
];
