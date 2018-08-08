import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, FindOperator } from 'typeorm';
import { Budget } from './budget';
import { Category } from './category';

@Entity()
export class BudgetCategory {
	@PrimaryGeneratedColumn()
	budgetCategoryId?: number;

	@ManyToOne(type => Budget, ba => ba.budgetCategories, { onDelete: 'CASCADE' })
	budget: Budget;

	@ManyToOne(type => Category, cat => cat.budgetCategories, { onDelete: 'CASCADE' })
	category: Category;

	//Amount of the transaction, negative for debit (money spent), positive for credit (money earnt)
	@Column()
	amount: number;

	@Column()
	note: string;

	constructor(budget: Budget, category: Category) {
		this.budget = budget;
		this.category = category;

		this.amount = 0;
		this.note = '';
	}
}
