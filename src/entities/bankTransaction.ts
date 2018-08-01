import * as dayjs from 'dayjs';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, FindOperator } from 'typeorm';
import { BankAccount } from './bankAccount';
import { Category } from './category';
import { ImportFile } from './importFile';

const moneyTransformer = {
	to(value: number | null) { return value == null ? null : (value * 100); },
	from(value: number | null) { return value == null ? null : (value / 100) }
};

export const dateTransformer = {
	to(value: dayjs.Dayjs) {

		if (value instanceof FindOperator) {
			return value;
		}
		return value.format("YYYY-MM-DD");
	},
	from(value: string) { return dayjs(value) }
};

@Entity()
export class BankTransaction {
	@PrimaryGeneratedColumn()
	bankTransactionId?: number;

	@ManyToOne(type => BankAccount, ba => ba.transactions, { onDelete: 'CASCADE' })
	bankAccount: BankAccount;

	@ManyToOne(type => Category, cat => cat.transactions, { onDelete: 'SET NULL' })
	category: Category | null;

	@ManyToOne(type => ImportFile, ifile => ifile.transactions, { onDelete: 'CASCADE' })
	importFile: ImportFile;

	//The date this transaction occurred
	@Column('text', { transformer: dateTransformer })
	date: dayjs.Dayjs;

	//Amount of the transaction, negative for debit (money spent), positive for credit (money earnt)
	@Column()
	amount: number;

	//Details about this transaction, provided by the bank
	@Column()
	description: string;

	//The balance after this transaction
	@Column('integer', { transformer: moneyTransformer })
	balance: number;

	@Column()
	userNote: string;
	
	//The unique ID given to this transaction by the bank. FITID in OFX files. Unique per bankAccount
	@Column()
	uniqueId: string;

	constructor(bankAccount: BankAccount, category: Category | null, importFile: ImportFile, date: dayjs.Dayjs, amount: number, description: string, balance: number, uniqueId: string) {
		this.bankAccount = bankAccount;
		this.category = category;
		this.importFile = importFile;
		this.date = date;
		this.amount = amount;
		this.description = description;
		this.balance = balance;
		this.uniqueId = uniqueId;

		this.userNote = '';
	}
}
