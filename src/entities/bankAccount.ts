import { Entity, Column, PrimaryGeneratedColumn, OneToMany, Unique, Index } from 'typeorm';
import { BankTransaction } from './bankTransaction';

@Entity()
@Unique(['bankAccountNumber'])
export class BankAccount {
	@PrimaryGeneratedColumn()
	bankAccountId?: number;

	@Column()
    @Index({ unique: true })
	bankAccountNumber: string;

	@Column()
    @Index({ unique: true })
	name: string;

	@OneToMany(type => BankTransaction, bt => bt.bankAccount)
	transactions?: BankTransaction[];

	constructor(bankAccountNumber: string, name: string) {
		this.bankAccountNumber = bankAccountNumber;
		this.name = name;
	}
}