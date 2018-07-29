import * as dayjs from 'dayjs';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne } from 'typeorm';
import { BankTransaction, dateTransformer } from './bankTransaction';
import { ImportFileContents } from './importFileContents';

@Entity()
export class ImportFile {
	@PrimaryGeneratedColumn()
	importFileId?: number;

	@Column()
	fileName: string;

	@Column('text', { transformer: dateTransformer })
	dateImported: dayjs.Dayjs;

	@OneToOne(type => ImportFileContents)
	importFileContents!: ImportFileContents;

	@OneToMany(type => BankTransaction, bt => bt.importFile)
	transactions?: BankTransaction[];

	constructor(fileName: string, fileContents: string, dateImported: dayjs.Dayjs) {
		this.fileName = fileName;
		this.dateImported = dateImported;

		//Typeorm constructs us with undefined before populating while loading from db, so don't create these before we are populated
		if (fileContents) {
			this.importFileContents = new ImportFileContents(fileContents, this);
		}
	}
}
