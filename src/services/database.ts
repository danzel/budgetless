import { injectable } from "inversify";
import { createConnection, Connection, Repository } from "typeorm";
import { BankAccount } from "../entities";

@injectable()
export class Database {
	constructor(
		public connection: Connection,
		public bankAccounts: Repository<BankAccount>
	) { }
}

export async function createDatabase() {
	console.log("Creating the database");
	let connection = await createConnection();
	let bankAccounts = connection.getRepository(BankAccount);

	return new Database(connection, bankAccounts);
}