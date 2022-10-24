module.exports = {
	root: true,
	env: {
		commonjs: true,
		node: true,
	},
	extends: 'airbnb-base',
	globals: {
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly',
	},
	parserOptions: {
		ecmaVersion: 2020,
	},
	rules: {
		indent: [
			'error',
			'tab',
		],
		'no-use-before-define': [
			'error',
			{
				variables: false,
			},
		],
		'no-param-reassign': [
			'error',
			{
				props: false,
			},
		],
		'no-tabs': 0,
		'max-len': 0,
		'no-bitwise': 0,
	},
	ignorePatterns: [
		'*.min.js',
	],
};
