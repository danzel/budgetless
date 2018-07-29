import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { ImportFile } from './importFile';

@Entity()
export class ImportFileContents {
	@PrimaryGeneratedColumn()
	importFileContentsId?: number;

	@Column()
	fileData: string;

	@OneToOne(type => ImportFile, { onDelete: 'CASCADE' })
	@JoinColumn()
	importFile: ImportFile;

	constructor(fileData: string, importFile: ImportFile) {
		this.fileData = fileData;
		this.importFile = importFile;
	}
}
