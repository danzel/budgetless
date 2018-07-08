import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
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
	name: string;

	constructor(name: string) {
		this.name = name;
	}
}