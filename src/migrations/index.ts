import { AddBankAccount1530325987669 } from './1530325987669-AddBankAccount';
import { AddCategoryAndTransactions1530403322314 } from './1530403322314-AddCategoryAndTransactions';
import { UniqueAccountNumber1530413909468 } from './1530413909468-UniqueAccountNumber';
import { CascadeFks1530414977337 } from './1530414977337-CascadeFks';
import { AddCategoryRule1531018861196 } from './1531018861196-AddCategoryRule';
import { AddImportFile1532854900547 } from './1532854900547-AddImportFile';
import { AddUniqueConstraints1532937490673 } from './1532937490673-AddUniqueConstraints';
import { TidyUpBalance1533110827233 } from './1533110827233-TidyUpBalance';
import { AddTransactionUniqueId1533112626205 } from './1533112626205-AddTransactionUniqueId';
import { AddBudget1533623403755 } from './1533623403755-AddBudget';

export const allMigrations = [
	AddBankAccount1530325987669,
	AddCategoryAndTransactions1530403322314,
	UniqueAccountNumber1530413909468,
	CascadeFks1530414977337,
	AddCategoryRule1531018861196,
	AddImportFile1532854900547,
	AddUniqueConstraints1532937490673,
	TidyUpBalance1533110827233,
	AddTransactionUniqueId1533112626205,
	AddBudget1533623403755,
]