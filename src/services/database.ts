import { injectable } from "inversify";
import { createConnection, getConnection, Connection, Repository } from "typeorm";
import { BankAccount, BankTransaction, Category } from "../entities";
import { SqliteConnectionOptions } from "typeorm/driver/sqlite/SqliteConnectionOptions";

let ormConfig: SqliteConnectionOptions = require('../../ormconfig.json')

@injectable()
export class Database {
	constructor(
		public connection: Connection,
		public bankAccounts: Repository<BankAccount>,
		public categories: Repository<Category>,
		public transactions: Repository<BankTransaction>
	) { }
}

export async function createDatabase(config?: SqliteConnectionOptions) {
	console.log("Creating the database");

	if (config) {
		config = { ...ormConfig, ...config};
	} else {
		config = ormConfig;
	}

	let name = config.name || 'default';

	//Makes hot-reload work
	try {
		let connection = getConnection(name);
		if (connection.isConnected) {
			await connection.close();
		}
	} catch (err) {
		//Do nothing
	}

	let connection = await createConnection(config);

	await connection.runMigrations();
	let bankAccounts = connection.getRepository(BankAccount);
	let categories = connection.getRepository(Category);
	let transactions = connection.getRepository(BankTransaction);

	return new Database(connection, bankAccounts, categories, transactions);
}