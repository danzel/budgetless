import { Entity, Column, PrimaryGeneratedColumn, OneToMany, Unique, Index } from 'typeorm';
import { BudgetCategory } from './budgetCategory';

@Entity()
export class Budget {
	@PrimaryGeneratedColumn()
	budgetId?: number;

	@Column()
    @Index({ unique: true })
	name: string;

	@OneToMany(type => BudgetCategory, bt => bt.budget)
	budgetCategories?: BudgetCategory[];

	constructor(name: string) {
		this.name = name;
	}
}