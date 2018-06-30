import * as dayjs from 'dayjs';

export interface ParseTransaction {

	//The date the transaction occurred
	date: dayjs.Dayjs;

	//Amount of the transaction, negative for debit (money spent), positive for credit (money earnt)
	amount: number;

	//Details about this transaction
	note: string;

	//The balance after this transaction
	balance?: number;
}

export interface ParseResult {
	bankAccountNumber: string;
	transactions: ParseTransaction[];
}