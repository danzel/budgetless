import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class BankAccount {
	@PrimaryGeneratedColumn()
	bankAccountId?: number;

	@Column()
	bankAccountNumber: string;

	@Column()
	name: string;

	constructor(bankAccountNumber: string, name: string) {
		this.bankAccountNumber = bankAccountNumber;
		this.name = name;
	}
}