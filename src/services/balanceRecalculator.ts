import { inject, injectable } from "inversify";
import { Services } from "./serviceEnum";
import { Database } from "./database";
import { BankAccount, BankTransaction } from "../entities";

@injectable()
export class BalanceRecalculator {
	constructor(@inject(Services.Database) private database: Database) {
	}

	// Recalculates the balance of all transactions in the given account based off the initial balance of the bank account being zero
	//TODO: We should probably allow the user to set the initial balance?
	//TODO: Or recalculate off the 'current' balance (OFX gives us current bank account balance, which is useless for old stuff?
	async recalculateAccountBalanceFromInitialZero(account: BankAccount) {
		let transactions = await this.database.transactions.find({
			where: {
				bankAccount: account
			},
			order: {
				date: "ASC",
				bankTransactionId: "ASC"
			}
		});

		let changedTransactions = new Array<BankTransaction>();

		let balance = 0;
		transactions.forEach(t =>{
			balance += t.amount;

			if (!t.balance || t.balance.toFixed(2) != balance.toFixed(2)) {
				changedTransactions.push(t);
				t.balance = balance;
			}
		});

		while (changedTransactions.length > 0) {
			let slice = changedTransactions.splice(0, 100)
			await this.database.transactions.save(slice);
		}
	}
}