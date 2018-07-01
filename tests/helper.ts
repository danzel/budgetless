import { Database, createDatabase } from "../src/services/database";

export async function withDatabase(testMethod: (database: Promise<Database>) => Promise<void>): Promise<void> {
	let database = createDatabase({
		type: 'sqlite',
		database: ':memory:'
	});
	try {
		await testMethod(database);
	} finally {
		(await database).connection.close();

	}
}