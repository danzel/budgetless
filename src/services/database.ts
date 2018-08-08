import { injectable } from "inversify";
import { createConnection, getConnection, Connection, Repository, EntityManager } from "typeorm";
import { BankAccount, BankTransaction, Category, CategoryRule, Budget } from "../entities";
import { SqliteConnectionOptions } from "typeorm/driver/sqlite/SqliteConnectionOptions";

let ormConfig: SqliteConnectionOptions = require('../../ormconfig.json')

/**
 * Holds database and repositories.
 * Connection and repositories are not valid until readyPromise has resolved.
 */
@injectable()
export class Database {

	isReady = false;
	readyPromise: Promise<void>;

	public connection!: Connection;

	public bankAccounts!: Repository<BankAccount>;
	public budgets!: Repository<Budget>;
	public categories!: Repository<Category>;
	public transactions!: Repository<BankTransaction>;
	public rules!: Repository<CategoryRule>;
	public entityManager!: EntityManager;

	constructor(config: SqliteConnectionOptions) {
		this.readyPromise = this.load(config);
	}

	private async load(config: SqliteConnectionOptions) {
		const name = config.name || 'default';

		//Makes hot-reload work
		try {
			let connection = getConnection(name);
			if (connection.isConnected) {
				await connection.close();
			}
		} catch (err) {
			//Do nothing
		}

		this.connection = await createConnection(config);

		await this.connection.runMigrations();
		this.bankAccounts = this.connection.getRepository(BankAccount);
		this.budgets = this.connection.getRepository(Budget);
		this.categories = this.connection.getRepository(Category);
		this.transactions = this.connection.getRepository(BankTransaction);
		this.rules = this.connection.getRepository(CategoryRule);
		this.entityManager = this.connection.createEntityManager();

		this.isReady = true;
	}
}

export function createDatabase(config?: SqliteConnectionOptions) {
	console.log("Creating the database");

	if (config) {
		config = { ...ormConfig, ...config};
	} else {
		config = ormConfig;
	}

	return new Database(config);
}