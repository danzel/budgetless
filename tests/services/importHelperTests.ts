import test from 'ava';

import { ImportHelper } from "../../src/services/importHelper";
import { withDatabase } from '../helper';
import * as dayjs from 'dayjs';
import { BankTransaction, BankAccount } from '../../src/entities';

test('ImportHelper finds no dupe for first transaction', async t => withDatabase(async database => {
	let importHelper = new ImportHelper(database);
	let db = (await database);

	await db.bankAccounts.insert({
		bankAccountNumber: '1',
		name: 'Account 1'
	});

	let result = await importHelper.dupeCheck({
		bankAccountNumber: '1',
		transactions: [
			{
				amount: 100,
				balance: 100,
				date: dayjs('2018-01-01'),
				note: 'SOME TRANSACTION'
			}
		]
	})
	
	t.is(result.newTransactions.length, 1);
	t.is(result.duplicates.length, 0);
}));

test('ImportHelper finds dupe', async t => withDatabase(async database => {
	let importHelper = new ImportHelper(database);
	let db = (await database);

	let account: BankAccount = await db.bankAccounts.save({
		bankAccountNumber: '1',
		name: 'Account 1'
	});

	await db.transactions.save(<BankTransaction>{
		amount: 100,
		balance: 100,
		date: dayjs('2018-01-01'),
		note: 'SOME TRANSACTION',
		userNote: '',
		bankAccount: account
	})

	let result = await importHelper.dupeCheck({
		bankAccountNumber: '1',
		transactions: [
			{
				amount: 100,
				balance: 100,
				date: dayjs('2018-01-01'),
				note: 'SOME TRANSACTION'
			}
		]
	})
	
	t.is(result.newTransactions.length, 0);
	t.is(result.duplicates.length, 1);
}));