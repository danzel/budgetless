import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Category } from './category';
import { BankTransaction } from './bankTransaction';

@Entity()
export class CategoryRule {
	@PrimaryGeneratedColumn()
	categoryRuleId?: number;

	@ManyToOne(type => Category, cat => cat.rules, { onDelete: 'CASCADE', eager: true })
	category: Category;

	@Column()
	descriptionContains: string;

	constructor(category: Category, descriptionContains: string) {
		this.category = category;

		this.descriptionContains = descriptionContains;
	}

	matches(transaction: BankTransaction): boolean {
		return transaction.description.toLocaleLowerCase().includes(this.descriptionContains.toLocaleLowerCase());
	}
}