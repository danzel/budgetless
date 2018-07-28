import * as React from 'react';
import { Callout, Intent, FileInput, MenuItem, Button, Toaster } from '@blueprintjs/core';
import * as parse from 'csv-parse';
import * as dayjs from 'dayjs';
import { BankAccount, Category, UncategorisedCategory, CategoryRule, BankTransaction } from './entities';
import { lazyInject, Services, Database, ImportHelper } from './services';
import { MoneyAmount } from './components';

interface BuxferRecord {
	Account: string;
	Amount: string;
	Currency: string;
	Date: string;
	/** From Bank */
	Description: string;
	/** User entered memo? */
	Memo: string;
	Status: string;
	Tags: string;
	Type: string;
};

interface State {
	accounts?: BankAccount[];
	categories?: Category[];
	rules?: CategoryRule[];

	stats?: Map<number, { amount: number, count: number }>;

	buxfer?: {
		accountsMap: Map<string, BankAccount>;

		tagsMap: Map<string, Category>;

		rows: BuxferRecord[];

	}
};

export class BuxferImport extends React.Component<{}, State> {
	@lazyInject(Services.Database)
	private database!: Promise<Database>;

	@lazyInject(Services.Toaster)
	private toaster!: Toaster;

	constructor(props: any) {
		super(props);

		this.state = {};

		this.loadFromDb();
	}

	private async loadFromDb() {
		let db = await this.database;

		let accounts = await db.bankAccounts.find();
		let categories = await db.categories.find();
		let rules = await db.rules.find();

		this.setState({
			accounts: accounts,
			categories: [UncategorisedCategory, ...categories],
			rules: rules
		});
	}

	fileInputChange(e: React.FormEvent<HTMLInputElement>): any {
		if (!e.currentTarget.files) {
			return;
		}

		let reader = new FileReader();
		reader.addEventListener('load', () => {
			let data: string = reader.result;
			console.log('file loaded: ' + data.length);

			parse(data, { relax_column_count: true, columns: true }, (err, output: BuxferRecord[]) => {
				console.log('parsed', err, output);
				if (err) {
					alert(err);
					return;
				}

				//All my records are Status=Cleared, not sure what to do with other status
				let badRecords = output.filter(r => r.Status != 'Cleared');
				if (badRecords.length > 0) {
					alert('Dont know how to handle records with status: ' + badRecords[0].Status);
					return;
				}

				//Split transfers in to two transactions
				//Transfers have an account of "Account Name 1 > Account Name 2", where money is moved from 1 to 2
				//If they are a properly linked transfer then the amount is positive
				var length = output.length;
				for (var i = 0; i < length; i++) {
					let r = output[i];

					if (r.Type == 'Transfer') {
						let splitIndex = r.Account.indexOf(' > ');
						if (splitIndex >= 0) {

							//Create a copy that is a deposit in the target account
							var copy = { ...r };
							copy.Account = copy.Account.substr(splitIndex + 3);
							output.push(copy);

							//Change existing one to be withdrawal from source account
							r.Amount = '-' + r.Amount;
							r.Account = r.Account.substr(0, splitIndex);
						}
					}
				}


				var allAccounts = Array.from(new Set<string>(output.map(o => o.Account)));
				allAccounts.sort((a, b) => a.localeCompare(b));
				var accountsMap = new Map<string, BankAccount>();
				allAccounts.forEach(a => {
					accountsMap.set(a, this.state.accounts![0]);
				})

				var allTags = Array.from(new Set<string>(output.map(o => o.Tags)));
				allTags.sort((a, b) => a.localeCompare(b));
				var tagsMap = new Map<string, Category>();
				allTags.forEach(a => {
					tagsMap.set(a, this.state.categories![0]);
				})


				this.setState({
					buxfer: {
						accountsMap: accountsMap,
						tagsMap: tagsMap,

						rows: output
					}
				}, () => this.recalculateResultingCategories())
			})
		});
		reader.readAsText(e.currentTarget.files[0]);

		e.currentTarget.value = '';
	}

	private selectAccount(accountName: string, allAccountsIndex: number) {
		var recreated = new Map(this.state.buxfer!.accountsMap);
		recreated.set(accountName, this.state.accounts![allAccountsIndex]);

		this.setState({
			buxfer: {
				...this.state.buxfer!,
				accountsMap: recreated
			}
		});
	}

	private selectCategory(tagName: string, categoryIndex: number) {
		var recreated = new Map(this.state.buxfer!.tagsMap);
		recreated.set(tagName, this.state.categories![categoryIndex]);

		this.setState({
			buxfer: {
				...this.state.buxfer!,
				tagsMap: recreated
			}
		}, () => this.recalculateResultingCategories());
	}

	private createBankTransactions(): BankTransaction[] {
		const buxfer = this.state.buxfer!;

		return buxfer.rows.map(r => {
			let acc = buxfer.accountsMap.get(r.Account);

			let cat = buxfer.tagsMap.get(r.Tags);
			if (cat!.categoryId == UncategorisedCategory.categoryId) {
				cat = undefined;
			}

			let t = new BankTransaction(acc!, cat!, dayjs(r.Date), parseFloat(r.Amount), r.Description, null);
			t.userNote = "From buxfer";
			if (r.Tags) {
				t.userNote += ". Tags: " + r.Tags;
			}
			if (r.Memo) {
				t.userNote += ". Memo: " + r.Memo;
			}
			return t;
		});
	}

	private recalculateResultingCategories() {
		//Apply all user defined category/tag maps
		let tx = this.createBankTransactions();

		//Apply rules
		new ImportHelper(this.database).applyRules(tx, this.state.rules!);

		//Calculate stats
		let statMap = new Map<number, { amount: number, count: number }>();
		tx.forEach(t => {
			let cat = t.category || UncategorisedCategory;
			var categoryId = cat.categoryId!;

			if (!statMap.has(categoryId)) {
				statMap.set(categoryId, { amount: t.amount, count: 1 });
			} else {
				let val = statMap.get(categoryId)!;
				val.amount += t.amount;
				val.count++;
			}
		});

		this.setState({
			stats: statMap
		});
	}

	private async import() {
		let tx = this.createBankTransactions();

		let db = await this.database;

		await db.transactions.save(tx);

		this.toaster.show({
			intent: Intent.SUCCESS,
			message: "Imported " + tx.length + " transactions"
		});

		this.setState({
			buxfer: undefined,
			stats: undefined
		});
	}

	render() {
		const allAccounts = this.state.accounts;
		const allCategories = this.state.categories;
		const buxfer = this.state.buxfer;

		if (!allAccounts || !allCategories || !buxfer) {
			return this.renderInitial();
		}

		return <div>
			<h5>Accounts</h5>
			<table className="pt-html-table pt-html-table-striped">
				<thead>
					<tr>
						<th>Buxfer Account</th>
						<th>Target Account</th>
					</tr>
				</thead>
				<tbody>
					{Array.from(buxfer.accountsMap).map(a => <tr key={a[0]}>
						<td>{a[0]}</td>
						<td><div className="pt-select"><select value={a[1].bankAccountId} onChange={s => this.selectAccount(a[0], s.currentTarget.selectedIndex)}>
							{allAccounts.map(b => <option value={b.bankAccountId}>{b.name}</option>)}
						</select></div></td>
					</tr>)}
				</tbody>
			</table>

			<h5>Categories</h5>
			<table className="pt-html-table pt-html-table-striped">
				<thead>
					<tr>
						<th>Buxfer Tag</th>
						<th>Target Category</th>
					</tr>
				</thead>
				<tbody>
					{Array.from(buxfer.tagsMap).map(t => <tr key={t[0]}>
						<td>{t[0]}</td>
						<td><div className="pt-select"><select value={t[1].categoryId} onChange={s => this.selectCategory(t[0], s.currentTarget.selectedIndex)}>
							{allCategories.map(b => <option value={b.categoryId}>{b.name}</option>)}
						</select></div></td>
					</tr>)}
				</tbody>
			</table>

			<h5>Stats</h5>
			<table className="pt-html-table pt-html-table-striped">
				<thead><tr><th>Category</th><th>Count</th><th>$ Sum</th></tr></thead>
				<tbody>
					{this.state.stats ? Array.from(this.state.stats).map(s => <tr key={s[0]}><td>{allCategories.find(c => c.categoryId == s[0])!.name}</td><td>{s[1].count}</td><td className='amount'><MoneyAmount amount={s[1].amount} /></td></tr>) : null}
				</tbody>
			</table>

			<Button text="Import" onClick={() => this.import()} />
		</div>;
	}

	renderInitial() {
		return <div className='buxfer-import'>
			<Callout intent={Intent.WARNING} style={{ marginTop: 10, textAlign: 'left' }}>
				<h4>Importing transactions from buxfer</h4>
				<ul>
					<li>Duplicate checking is not performed</li>
					<li>Account names must be mapped</li>
					<li>Tags must be mapped, otherwise rules will be applied to them</li>
					<li>Transfers will be split in to two transactions</li>
					<li>Make a backup of your database before importing in case we make a mess</li>
				</ul>
				<b>
					Only import data from buxfer that you cannot get as OFX.<br />
					Ideally you do this first (if you are migrating from buxfer) before starting to use budgetless.
				</b>
			</Callout>

			<FileInput text="Choose file..." onInputChange={e => this.fileInputChange(e)} />
		</div>;
	}
}