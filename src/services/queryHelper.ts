import { injectable, inject } from "inversify";
import { Database } from "./database";
import { Services } from "./serviceEnum";
import { Category, BankAccount, dateTransformer, EveryCategory, UncategorisedCategory } from "../entities";
import { Dayjs } from "../../node_modules/dayjs";

export interface CategorySum {
	category: Category;
	totalAmount: number;
}

@injectable()
export class QueryHelper {
	constructor(@inject(Services.Database) private database: Database) { }

	/**
	 * Calculates a net value change over all (or the given) category for the given date range and bank account(s)
	 */
	async calculateCategorySum(dateRange?: { start: Dayjs, end: Dayjs }, category?: Category, accounts?: BankAccount[]): Promise<CategorySum[]> {
		let categories = await this.database.categories.find();

		let query = "SELECT categoryId, SUM(amount) AS totalAmount " +
			"FROM bank_transaction " +
			"LEFT JOIN category ON categoryCategoryId=categoryId " +
			"WHERE 1 ";
		let parameters = new Array<any>();

		//bankAccount
		if (accounts) {
			query += "AND bankAccountBankAccountId IN (?";
			for (let i = 1; i < accounts.length; i++) {
				query += ",?";
			}
			query += ") ";
			parameters = parameters.concat(accounts.map(a => a.bankAccountId));
		}

		//selectedDateRange
		if (dateRange) {
			query += "AND date >= ? AND date <= ? ";
			parameters.push(dateTransformer.to(dateRange.start));
			parameters.push(dateTransformer.to(dateRange.end));
		}

		//selectedCategory
		if (!category || category.categoryId == EveryCategory.categoryId) {
			//No category filter
		} else if (category.categoryId == UncategorisedCategory.categoryId) {
			query += "AND categoryCategoryId IS NULL ";
		} else {
			query += "AND categoryCategoryId=? ";
			parameters.push(category.categoryId);
		}

		query += " GROUP BY categoryId";
		let queryRes: { categoryId?: number, totalAmount: number }[] = await this.database.connection.query(query, parameters);

		let res = queryRes.map(r => {
			return {
				category: (r.categoryId ? categories.find(c => c.categoryId == r.categoryId)! : UncategorisedCategory),
				totalAmount: r.totalAmount
			}
		});

		return res;
	}
}