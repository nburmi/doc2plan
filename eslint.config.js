import eslintPluginSvelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import tsEslint from 'typescript-eslint';
import tsParser from '@typescript-eslint/parser';

export default [
	...tsEslint.configs.strict,
	...eslintPluginSvelte.configs['flat/recommended'],
	{
		rules: {
			semi: ['warn', 'always'],
			quotes: ['warn', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
			'no-nested-ternary': 'error',
			'linebreak-style': ['error', 'unix'],
			'no-cond-assign': ['error', 'always'],
			'no-console': 'error',
			'@typescript-eslint/sort-type-constituents': 'error'
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: tsParser
			}
		},
		rules: {
			'svelte/no-target-blank': 'error',
			'svelte/no-at-debug-tags': 'error',
			'svelte/no-reactive-functions': 'error',
			'svelte/no-reactive-literals': 'error'
		}
	}
];
