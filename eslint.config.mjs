import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

/**
 * Cấu hình ESLint — nhập thẳng từ gói `@dam/config` của bản gốc, GIỮ NGUYÊN các rule.
 *
 * Các quy tắc phản chiếu checklist chất lượng (BA NFR-03): hàm nhỏ, file tập trung, không lồng
 * sâu, không mutation tham số, không console.log lọt vào production.
 */
const IGNORE_PATTERNS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/.next/**',
  '**/.next-*/**',
  '**/coverage/**',
  '**/playwright-report/**',
  '**/test-results/**',
  '**/*.min.js',
];

export default tseslint.config(
  { ignores: IGNORE_PATTERNS },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.es2023 },
    },
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-param-reassign': ['error', { props: true }],
      'no-var': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],

      // Ngưỡng của checklist chất lượng
      'max-depth': ['error', 4],
      'max-lines': ['error', { max: 800, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': [
        'error',
        { max: 50, skipBlankLines: true, skipComments: true, IIFEs: true },
      ],

      // Xử lý lỗi tường minh — không nuốt lỗi
      '@typescript-eslint/no-floating-promises': 'off', // cần type-aware linting mới bật được
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    /**
     * File test được nới ngưỡng độ dài: một mô tả kịch bản dài không phải mùi code.
     */
    files: ['**/*.spec.ts', '**/*.test.ts', '**/*.spec.tsx', '**/*.test.tsx', 'e2e/**/*.ts'],
    rules: {
      'max-lines-per-function': 'off',
      'max-lines': 'off',
    },
  },
  {
    files: ['src/**/*.tsx', 'src/**/*.ts', 'test/**/*.tsx', 'test/**/*.ts'],
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  prettier,
);
