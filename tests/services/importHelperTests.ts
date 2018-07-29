import test from 'ava';

import { ImportHelper } from "../../src/services/importHelper";
import { withDatabase } from '../helper';
import * as dayjs from 'dayjs';
import { BankTransaction, BankAccount, Category, ImportFile } from '../../src/entities';

test('ImportHelper finds no dupe for first transaction', async t => withDatabase(async database => {
	let importHelper = new ImportHelper(database);

	await database.bankAccounts.save({
		bankAccountNumber: '1',
		name: 'Account 1'
	});

	let result = await importHelper.dupeCheck({
		bankAccountNumber: '1',
		importFile: new ImportFile('', '', dayjs()),
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

test('ImportHelper finds dupe', async t => withDatabase(async db => {
	let importHelper = new ImportHelper(db);

	let account = await db.bankAccounts.save({
		bankAccountNumber: '1',
		name: 'Account 1'
	});

	await db.transactions.save(<BankTransaction>{
		amount: 100,
		balance: 100,
		date: dayjs('2018-01-01'),
		description: 'SOME TRANSACTION',
		userNote: '',
		bankAccount: account
	})

	let result = await importHelper.dupeCheck({
		bankAccountNumber: '1',
		importFile: new ImportFile('', '', dayjs()),
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

test('ImportHelper applies rules', async t => withDatabase(async db => {
	let importHelper = new ImportHelper(db);

	await db.bankAccounts.save({
		bankAccountNumber: '1',
		name: 'Account 1'
	});

	let category: Category = await db.categories.save({
		name: 'test'
	});
	let rule = await db.rules.save({
		category: category,
		descriptionContains: 'some'
	});

	let result = await importHelper.dupeCheck({
		bankAccountNumber: '1',
		importFile: new ImportFile('', '', dayjs()),
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

	t.truthy(result.newTransactions[0].category);
	t.is(result.newTransactions[0].category!.categoryId, category.categoryId);
}));
