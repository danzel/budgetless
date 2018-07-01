import { injectable } from "inversify";
import { createConnection, Connection, Repository } from "typeorm";
import { BankAccount, BankTransaction, Category } from "../entities";

let config = require('../../ormconfig.json')
config.entities = [
	BankAccount,
	BankTransaction,
	Category
];
config.migrations = [];

@injectable()
export class Database {
	constructor(
		public connection: Connection,
		public bankAccounts: Repository<BankAccount>
	) { }
}

export async function createDatabase() {
	console.log("Creating the database");
	let connection = await createConnection(config);
	let bankAccounts = connection.getRepository(BankAccount);

	return new Database(connection, bankAccounts);
}