import js from '@eslint/js'
import prettierConfig from 'eslint-config-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

/**
 * ESLint configuration for the Digital Invite project.
 *
 * The rule set is tuned for Clean Code: descriptive names, small single-purpose
 * functions, no implicit or explicit `any`, and exhaustive React hook
 * dependencies. Formatting is delegated entirely to Prettier, so
 * `eslint-config-prettier` is applied last to switch off every stylistic rule
 * that would otherwise conflict with it.
 */
export default tseslint.config(
  {
    ignores: ['dist', 'node_modules', 'src/components/ui'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...reactRefresh.configs.vite.rules,

      // React hooks: dependency arrays must be complete, no exceptions.
      'react-hooks/exhaustive-deps': 'error',

      // Imports: use the `@/` alias instead of climbing two or more directories.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../../*', '../../**'],
              message: 'Use the `@/` alias instead of a parent-relative import two or more levels up.',
            },
          ],
        },
      ],

      // Type safety: nothing untyped crosses a module boundary.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      // Unused bindings are removed, not renamed with an underscore prefix.
      '@typescript-eslint/no-unused-vars': 'error',

      // Clean Code: descriptive names.
      camelcase: ['error', { properties: 'never' }],
      'id-length': [
        'error',
        { min: 3, exceptions: ['id', 'to', 'db', 'fn', 'on'], properties: 'never' },
      ],

      // Clean Code: small, shallow, single-purpose functions.
      complexity: ['error', { max: 8 }],
      'max-depth': ['error', 3],
      'max-lines-per-function': ['error', { max: 60, skipBlankLines: true, skipComments: true }],
      'max-params': ['error', 3],
      'max-nested-callbacks': ['error', 3],

      // Clean Code: predictable, side-effect-free expressions.
      eqeqeq: ['error', 'always'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-else-return': ['error', { allowElseIf: false }],
      'no-param-reassign': 'error',
      'prefer-const': 'error',
    },
  },
  {
    // Config files run in Node and are not part of the app's type-checked graph.
    files: ['*.config.{js,ts}'],
    languageOptions: {
      globals: globals.node,
    },
    ...tseslint.configs.disableTypeChecked,
  },
  prettierConfig,
)
