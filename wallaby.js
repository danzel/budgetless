const tsConfig = require('./tsconfig.json');
tsConfig.compilerOptions.module = 'commonjs';

module.exports = function (wallaby) {
	return {
		files: [
			'tests/resources/*.ofx',
			"src/**/*.ts"
		],
		tests: [
			"tests/**/*.ts"
		],
		compilers: {
			'**/*.ts?(x)': wallaby.compilers.typeScript(tsConfig.compilerOptions)
		},
		testFramework: 'ava',
		env: {
			type: 'node',
			runnder: 'node'
		}
	}
}