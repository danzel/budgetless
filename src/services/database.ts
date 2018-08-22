import { injectable } from "inversify";
import { remote } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { createConnection, getConnection, Connection, Repository, EntityManager } from "typeorm";
import * as E from "../entities";
import { SqliteConnectionOptions } from "typeorm/driver/sqlite/SqliteConnectionOptions";
import { allMigrations } from '../migrations';

let ormConfig: SqliteConnectionOptions = require('../../ormconfig.json');
const directory = path.join((remote.getCurrentWindow() as any).documentsPath, 'budgetless');
if (!fs.existsSync(directory)) {
	fs.mkdirSync(directory);
}
(ormConfig as any).database = path.join(directory, 'database.sqlite');
console.log('database path', ormConfig.database);

(ormConfig as any).migrations = allMigrations;
(ormConfig as any).entities = [
	E.BankAccount,
	E.BankTransaction,
	E.Budget,
	E.BudgetCategory,
	E.Category,
	E.CategoryRule,
	E.ImportFile,
	E.ImportFileContents,
];

/**
 * Holds database and repositories.
 * Connection and repositories are not valid until readyPromise has resolved.
 */
@injectable()
export class Database {

	isReady = false;
	readyPromise: Promise<void>;

	public connection!: Connection;
	public databaseLocation!: string;

	public bankAccounts!: Repository<E.BankAccount>;
	public budgets!: Repository<E.Budget>;
	public categories!: Repository<E.Category>;
	public transactions!: Repository<E.BankTransaction>;
	public rules!: Repository<E.CategoryRule>;
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
		this.databaseLocation = directory;

		await this.connection.runMigrations();
		this.bankAccounts = this.connection.getRepository(E.BankAccount);
		this.budgets = this.connection.getRepository(E.Budget);
		this.categories = this.connection.getRepository(E.Category);
		this.transactions = this.connection.getRepository(E.BankTransaction);
		this.rules = this.connection.getRepository(E.CategoryRule);
		this.entityManager = this.connection.createEntityManager();

		this.isReady = true;
	}
}

export function createDatabase(config?: SqliteConnectionOptions) {
	console.log("Creating the database");

	if (config) {
		config = { ...ormConfig, ...config };
	} else {
		config = ormConfig;
	}

	return new Database(config);
}