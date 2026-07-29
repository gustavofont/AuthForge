// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'dist/**', 'coverage/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        node: true,
        jest: true,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
    },
  },
  {
    files: ['**/*.spec.ts'],
    rules: {
      // jest.Mocked<Interface> methods are plain jest.fn() properties at
      // runtime; this rule's static analysis can't see that and flags
      // every `expect(mock.method)`/`mock.method.mockResolvedValue(...)`.
      '@typescript-eslint/unbound-method': 'off',
      // expect.any()/expect.objectContaining() are untyped (any) by design.
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
);
