import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { BankTransaction } from './bankTransaction';

@Entity()
export class Category {
	@PrimaryGeneratedColumn()
	categoryId?: number;

	@OneToMany(type => BankTransaction, bt => bt.bankAccount)
	transactions?: BankTransaction[];

	@Column()
	name: string;

	constructor(name: string) {
		this.name = name;
	}
}