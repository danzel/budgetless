import {MigrationInterface, QueryRunner} from "typeorm";

export class AddCategoryAndTransactions1530403322314 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "category" ("categoryId" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "bank_transaction" ("bankTransactionId" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "date" text NOT NULL, "amount" integer NOT NULL, "note" varchar NOT NULL, "balance" integer, "calculatedBalance" integer, "userNote" varchar NOT NULL, "bankAccountBankAccountId" integer, "categoryCategoryId" integer)`);
        await queryRunner.query(`CREATE TABLE "temporary_bank_transaction" ("bankTransactionId" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "date" text NOT NULL, "amount" integer NOT NULL, "note" varchar NOT NULL, "balance" integer, "calculatedBalance" integer, "userNote" varchar NOT NULL, "bankAccountBankAccountId" integer, "categoryCategoryId" integer, CONSTRAINT "FK_3383fd03b1fba77bf5aeb9383f4" FOREIGN KEY ("bankAccountBankAccountId") REFERENCES "bank_account" ("bankAccountId"), CONSTRAINT "FK_db55b94d4cb02fe2e2f25508ece" FOREIGN KEY ("categoryCategoryId") REFERENCES "category" ("categoryId"))`);
        await queryRunner.query(`INSERT INTO "temporary_bank_transaction"("bankTransactionId", "date", "amount", "note", "balance", "calculatedBalance", "userNote", "bankAccountBankAccountId", "categoryCategoryId") SELECT "bankTransactionId", "date", "amount", "note", "balance", "calculatedBalance", "userNote", "bankAccountBankAccountId", "categoryCategoryId" FROM "bank_transaction"`);
        await queryRunner.query(`DROP TABLE "bank_transaction"`);
        await queryRunner.query(`ALTER TABLE "temporary_bank_transaction" RENAME TO "bank_transaction"`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "bank_transaction" RENAME TO "temporary_bank_transaction"`);
        await queryRunner.query(`CREATE TABLE "bank_transaction" ("bankTransactionId" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "date" text NOT NULL, "amount" integer NOT NULL, "note" varchar NOT NULL, "balance" integer, "calculatedBalance" integer, "userNote" varchar NOT NULL, "bankAccountBankAccountId" integer, "categoryCategoryId" integer)`);
        await queryRunner.query(`INSERT INTO "bank_transaction"("bankTransactionId", "date", "amount", "note", "balance", "calculatedBalance", "userNote", "bankAccountBankAccountId", "categoryCategoryId") SELECT "bankTransactionId", "date", "amount", "note", "balance", "calculatedBalance", "userNote", "bankAccountBankAccountId", "categoryCategoryId" FROM "temporary_bank_transaction"`);
        await queryRunner.query(`DROP TABLE "temporary_bank_transaction"`);
        await queryRunner.query(`DROP TABLE "bank_transaction"`);
        await queryRunner.query(`DROP TABLE "category"`);
    }

}
