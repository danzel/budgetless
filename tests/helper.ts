import { Database, createDatabase } from "../src/services/database";

export async function withDatabase(testMethod: (database: Database) => Promise<void>): Promise<void> {
	let database = createDatabase({
		type: 'sqlite',
		database: ':memory:',
		//Running ava under wallaby needs this with .js
		entities: [
			"src/entities/**/*.js"
		],
		migrations: [
			"src/migrations/**/*.js"
		],
	});
	await database.readyPromise;
	try {
		await testMethod(database);
	} finally {
		(await database).connection.close();

	}
}