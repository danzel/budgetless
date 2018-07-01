import { ParseResult, ParseTransaction } from './parseResult';
import { Database } from './database';
import { Between } from 'typeorm';
import { dateTransformer, BankTransaction } from '../entities';

export interface DupeCheckResult {
	duplicates: ParseTransaction[];
	newTransactions: BankTransaction[];
}

/** Helps manipulate data for inserting in to the database */
export class ImportHelper {
	constructor(private databasePromise: Promise<Database>) {
	}

	/** Separates out the provided transactions in to duplicates and not duplicates */
	async dupeCheck(values: ParseResult): Promise<DupeCheckResult> {
		if (values.transactions.length == 0) {
			return { duplicates: [], newTransactions: [] };
		}
		
		let minDate = values.transactions[0].date;
		let maxDate = values.transactions[0].date;

		values.transactions.forEach(t => {
			if (t.date.isBefore(minDate)) {
				minDate = t.date;
			}
			if (t.date.isAfter(maxDate)) {
				maxDate = t.date;
			}
		});

		let account = await (await this.databasePromise).bankAccounts.findOne({
			bankAccountNumber: values.bankAccountNumber
		});

		if (!account) {
			throw new Error("Bank account not found: " + values.bankAccountNumber)
		}

		let existing = await (await this.databasePromise).transactions.find({
			date: Between(dateTransformer.to(minDate), dateTransformer.to(maxDate)),
			bankAccount: account
		});

		let result: DupeCheckResult = {
			duplicates: [],
			newTransactions: []
		};

		values.transactions.forEach(t => {
			if (existing.some(e => e.amount == t.amount && e.date == t.date && e.note == t.note)) {
				result.duplicates.push(t);
			} else {
				result.newTransactions.push(new BankTransaction(account!, undefined, t.date, t.amount, t.note, t.balance));
			}
		})

		return result;
	}
}