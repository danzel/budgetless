const tsConfig = require('./tsconfig.commonjs.json');

module.exports = function (wallaby) {
	return {
		files: [
			'tests/resources/*.ofx',
			'tests/helper.ts',
			"src/**/*.ts",
			'./ormconfig.json'
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