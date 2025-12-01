import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
    resolvePluginsRelativeTo: __dirname,
});

export default [
    js.configs.recommended,
    {
        ignores: ['node_modules/', '.next/', 'out/', 'build/', '*.config.js', '*.config.mjs', '*.config.ts'],
    },
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                React: 'readonly',
                JSX: 'readonly',
                NodeJS: 'readonly',
                // Browser globals
                window: 'readonly',
                document: 'readonly',
                console: 'readonly',
                HTMLElement: 'readonly',
                HTMLDivElement: 'readonly',
                MouseEvent: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                alert: 'readonly',
                // Node.js globals
                module: 'readonly',
                require: 'readonly',
                process: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                // Browser APIs
                localStorage: 'readonly',
                fetch: 'readonly',
                Blob: 'readonly',
                URL: 'readonly',
                File: 'readonly',
                FileReader: 'readonly',
                // DOM types
                SVGSVGElement: 'readonly',
                Document: 'readonly',
                HTMLScriptElement: 'readonly',
                Node: 'readonly',
                // Web API types (for server-side code)
                Request: 'readonly',
                Response: 'readonly',
                Headers: 'readonly',
                URLSearchParams: 'readonly',
                // Streaming APIs
                TextEncoder: 'readonly',
                TextDecoder: 'readonly',
                ReadableStream: 'readonly',
                AbortController: 'readonly',
                // Browser events
                BeforeUnloadEvent: 'readonly',
                PopStateEvent: 'readonly',
                // Test globals
                beforeEach: 'readonly',
                afterEach: 'readonly',
                describe: 'readonly',
                it: 'readonly',
                expect: 'readonly',
                vi: 'readonly',
                globalThis: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': typescriptEslint,
            react: reactPlugin,
            'react-hooks': reactHooksPlugin,
            import: importPlugin,
            'simple-import-sort': simpleImportSort,
            'unused-imports': unusedImports,
        },
        rules: {
            // Import sorting
            'simple-import-sort/imports': [
                'error',
                {
                    groups: [
                        // External packages
                        ['^\\w'],
                        // Internal packages
                        ['^@/'],
                        // Relative imports
                        ['^\\.'],
                    ],
                },
            ],
            'simple-import-sort/exports': 'error',
            'import/first': 'error',
            'import/newline-after-import': 'error',
            'import/no-duplicates': 'error',

            // Unused imports
            'unused-imports/no-unused-imports': 'error',
            'unused-imports/no-unused-vars': [
                'warn',
                {
                    vars: 'all',
                    varsIgnorePattern: '^_',
                    args: 'after-used',
                    argsIgnorePattern: '^_',
                },
            ],

            // TypeScript specific
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-non-null-assertion': 'warn',
            // Disable no-unused-vars for TypeScript, use @typescript-eslint version instead
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],

            // General best practices
            'no-console': 'off',
            'no-debugger': 'error',
            'no-var': 'error',
            'prefer-const': 'error',
            'object-shorthand': 'error',
            'prefer-template': 'error',
            'no-case-declarations': 'off',
            'react/no-unescaped-entities': 'off',
        },
        settings: {
            'import/resolver': {
                node: {
                    extensions: ['.js', '.jsx', '.ts', '.tsx'],
                },
            },
        },
    },
];
