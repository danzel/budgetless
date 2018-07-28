import { ParseResult, ParseTransaction } from './parseResult';
import { Database } from './database';
import { Between } from 'typeorm';
import { dateTransformer, BankTransaction, CategoryRule } from '../entities';

export interface DupeCheckResult {
	duplicates: ParseTransaction[];
	newTransactions: BankTransaction[];
}

/** Helps manipulate data for inserting in to the database */
export class ImportHelper {
	constructor(private databasePromise: Promise<Database>) {
	}

	/** Separates out the provided transactions in to duplicates and not duplicates. not duplicates are categories by the existing rules */
	async dupeCheck(values: ParseResult): Promise<DupeCheckResult> {
		if (values.transactions.length == 0) {
			return { duplicates: [], newTransactions: [] };
		}

		let db = (await this.databasePromise);

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

		let account = await db.bankAccounts.findOne({
			bankAccountNumber: values.bankAccountNumber
		});

		if (!account) {
			throw new Error("Bank account not found: " + values.bankAccountNumber)
		}

		let existing = await db.transactions.find({
			date: Between(dateTransformer.to(minDate), dateTransformer.to(maxDate)),
			bankAccount: account
		});

		let result: DupeCheckResult = {
			duplicates: [],
			newTransactions: []
		};

		values.transactions.forEach(t => {
			if (existing.some(e => e.amount == t.amount && e.date.isSame(t.date) && e.description == t.note)) {
				result.duplicates.push(t);
			} else {
				result.newTransactions.push(new BankTransaction(account!, null, t.date, t.amount, t.note, t.balance));
			}
		})

		//Apply the rules
		let rules = await db.rules.find();
		this.applyRules(result.newTransactions, rules);

		return result;
	}

	/** Applies the given rules to the given transactions and returns those transactions that received categories. 
	 * Transactions that have existing categories will NOT have those categories changed.
	*/
	applyRules(transactions: BankTransaction[], rules: CategoryRule[]): BankTransaction[] {
		let res = new Array<BankTransaction>();

		transactions.forEach(t => {
			for (let i = 0; i < rules.length; i++) {
				let r = rules[i];
				if (!t.category && r.matches(t)) {
					t.category = r.category;
					res.push(t);
					break;
				}
			}
		})

		return res;
	}

	/** Applies the given rule to all matching transactions in the database, returning the transactions that match */
	async applyRuleToDatabase(rule: CategoryRule): Promise<BankTransaction[]> {
		let db = await this.databasePromise;

		let matching = await db.transactions.createQueryBuilder("tx")
			.where("lower(tx.description) LIKE lower(:rule)", { rule: '%' + rule.descriptionContains + '%' })
			.andWhere("tx.category IS NULL")
			.getMany();

		matching.forEach(m => m.category = rule.category);

		await db.transactions.save(matching);

		return matching;
	}
}