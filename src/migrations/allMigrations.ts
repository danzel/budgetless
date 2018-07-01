//This class re-exports all of the migrations to work around migrations trouble since we use webpack
import { AddBankAccount1530325987669 } from './1530325987669-AddBankAccount';
import { AddCategoryAndTransactions1530403322314 } from './1530403322314-AddCategoryAndTransactions';
import { UniqueAccountNumber1530413909468 } from './1530413909468-UniqueAccountNumber';
import { CascadeFks1530414977337 } from './1530414977337-CascadeFks';

export const allMigrations = [
	AddBankAccount1530325987669,
	AddCategoryAndTransactions1530403322314,
	UniqueAccountNumber1530413909468,
	CascadeFks1530414977337
];