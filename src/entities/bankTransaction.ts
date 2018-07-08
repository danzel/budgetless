import * as dayjs from 'dayjs';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, FindOperator } from 'typeorm';
import { BankAccount } from './bankAccount';
import { Category } from './category';

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
	category?: Category;

	//The date this transaction occurred
	@Column('text', {
		transformer: dateTransformer
	})
	date: dayjs.Dayjs;

	//Amount of the transaction, negative for debit (money spent), positive for credit (money earnt)
	@Column()
	amount: number;

	//Details about this transaction, provided by the bank
	@Column()
	description: string;

	//The balance after this transaction, provided by the bank
	@Column('integer', {
		nullable: true,
		transformer: moneyTransformer
	})
	balance: number | null;

	//The balance after this transaction, as calculated internally
	@Column('integer', {
		nullable: true,
		transformer: moneyTransformer
	})
	calculatedBalance: number | null;

	@Column()
	userNote: string;

	constructor(bankAccount: BankAccount, category: Category | undefined, date: dayjs.Dayjs, amount: number, note: string, balance: number | null) {
		this.bankAccount = bankAccount;
		this.category = category;
		this.date = date;
		this.amount = amount;
		this.description = note;

		this.balance = balance;
		this.calculatedBalance = balance;

		this.userNote = '';
	}
}
