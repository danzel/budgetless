import { Entity, Column, PrimaryGeneratedColumn, OneToMany, Index } from 'typeorm';
import { BankTransaction } from './bankTransaction';
import { CategoryRule } from './categoryRule';

@Entity()
export class Category {
	@PrimaryGeneratedColumn()
	categoryId?: number;

	@OneToMany(type => BankTransaction, bt => bt.bankAccount)
	transactions?: BankTransaction[];

	@OneToMany(type => CategoryRule, bt => bt.category)
	rules?: CategoryRule[];

	@Column()
    @Index({ unique: true })
	name: string;

	constructor(name: string) {
		this.name = name;
	}
}

export const EveryCategory = new Category("Everything");
EveryCategory.categoryId = -1;

export const UncategorisedCategory = new Category("Uncategorised");
UncategorisedCategory.categoryId = -2;

export const AddCategory = new Category("+");
AddCategory.categoryId = -3;