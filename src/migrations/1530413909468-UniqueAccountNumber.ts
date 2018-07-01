import {MigrationInterface, QueryRunner} from "typeorm";

export class UniqueAccountNumber1530413909468 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "temporary_bank_account" ("bankAccountId" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "bankAccountNumber" varchar NOT NULL, "name" varchar NOT NULL)`);
        await queryRunner.query(`INSERT INTO "temporary_bank_account"("bankAccountId", "bankAccountNumber", "name") SELECT "bankAccountId", "bankAccountNumber", "name" FROM "bank_account"`);
        await queryRunner.query(`DROP TABLE "bank_account"`);
        await queryRunner.query(`ALTER TABLE "temporary_bank_account" RENAME TO "bank_account"`);
        await queryRunner.query(`CREATE TABLE "temporary_bank_account" ("bankAccountId" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "bankAccountNumber" varchar NOT NULL, "name" varchar NOT NULL, CONSTRAINT "UQ_6bff5cfa3e14015a10aa321f9ef" UNIQUE ("bankAccountNumber"))`);
        await queryRunner.query(`INSERT INTO "temporary_bank_account"("bankAccountId", "bankAccountNumber", "name") SELECT "bankAccountId", "bankAccountNumber", "name" FROM "bank_account"`);
        await queryRunner.query(`DROP TABLE "bank_account"`);
        await queryRunner.query(`ALTER TABLE "temporary_bank_account" RENAME TO "bank_account"`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "bank_account" RENAME TO "temporary_bank_account"`);
        await queryRunner.query(`CREATE TABLE "bank_account" ("bankAccountId" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "bankAccountNumber" varchar NOT NULL, "name" varchar NOT NULL)`);
        await queryRunner.query(`INSERT INTO "bank_account"("bankAccountId", "bankAccountNumber", "name") SELECT "bankAccountId", "bankAccountNumber", "name" FROM "temporary_bank_account"`);
        await queryRunner.query(`DROP TABLE "temporary_bank_account"`);
        await queryRunner.query(`ALTER TABLE "bank_account" RENAME TO "temporary_bank_account"`);
        await queryRunner.query(`CREATE TABLE "bank_account" ("bankAccountId" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "bankAccountNumber" varchar NOT NULL, "name" varchar NOT NULL)`);
        await queryRunner.query(`INSERT INTO "bank_account"("bankAccountId", "bankAccountNumber", "name") SELECT "bankAccountId", "bankAccountNumber", "name" FROM "temporary_bank_account"`);
        await queryRunner.query(`DROP TABLE "temporary_bank_account"`);
    }

}
