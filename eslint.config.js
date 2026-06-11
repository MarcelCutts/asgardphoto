import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import astroPlugin from 'eslint-plugin-astro';

export default [
  eslint.configs.recommended,
  ...astroPlugin.configs['flat/recommended'],
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  // Node.js config files
  {
    files: ['playwright.config.ts', 'astro.config.mjs', 'eslint.config.js'],
    languageOptions: {
      globals: {
        process: 'readonly',
      },
    },
  },
  // Playwright test files - window/DOM types are used inside page.evaluate() browser context
  {
    files: ['tests/**/*.ts'],
    languageOptions: {
      globals: {
        window: 'readonly',
        HTMLImageElement: 'readonly',
      },
    },
  },
  {
    ignores: ['dist/', 'node_modules/', '.astro/'],
  },
];
