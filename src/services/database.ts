import { injectable } from "inversify";
import { createConnection, Connection, Repository } from "typeorm";
import { BankAccount, BankTransaction, Category } from "../entities";
import { SqliteConnectionOptions } from "typeorm/driver/sqlite/SqliteConnectionOptions";
import { allMigrations } from "../migrations/allMigrations";

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

	if (!config) {
		config = ormConfig;
	}
	(<any>config).entities = [
		BankAccount,
		BankTransaction,
		Category
	];
	(<any>config).migrations = allMigrations;

	let connection = await createConnection(config);
	await connection.runMigrations();
	let bankAccounts = connection.getRepository(BankAccount);
	let categories = connection.getRepository(Category);
	let transactions = connection.getRepository(BankTransaction);

	return new Database(connection, bankAccounts, categories, transactions);
}