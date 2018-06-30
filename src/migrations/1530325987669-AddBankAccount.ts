import {MigrationInterface, QueryRunner} from "typeorm";

export class AddBankAccount1530325987669 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "bank_account" ("bankAccountId" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "bankAccountNumber" varchar NOT NULL, "name" varchar NOT NULL)`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "bank_account"`);
    }

}
