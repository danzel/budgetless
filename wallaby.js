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
		testFramework: 'ava',
		env: {
			type: 'node',
			runnder: 'node'
		}
	}
}