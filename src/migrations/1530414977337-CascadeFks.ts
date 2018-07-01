import {MigrationInterface, QueryRunner} from "typeorm";

export class CascadeFks1530414977337 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "temporary_bank_transaction" ("bankTransactionId" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "date" text NOT NULL, "amount" integer NOT NULL, "note" varchar NOT NULL, "balance" integer, "calculatedBalance" integer, "userNote" varchar NOT NULL, "bankAccountBankAccountId" integer, "categoryCategoryId" integer)`);
        await queryRunner.query(`INSERT INTO "temporary_bank_transaction"("bankTransactionId", "date", "amount", "note", "balance", "calculatedBalance", "userNote", "bankAccountBankAccountId", "categoryCategoryId") SELECT "bankTransactionId", "date", "amount", "note", "balance", "calculatedBalance", "userNote", "bankAccountBankAccountId", "categoryCategoryId" FROM "bank_transaction"`);
        await queryRunner.query(`DROP TABLE "bank_transaction"`);
        await queryRunner.query(`ALTER TABLE "temporary_bank_transaction" RENAME TO "bank_transaction"`);
        await queryRunner.query(`CREATE TABLE "temporary_bank_account" ("bankAccountId" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "bankAccountNumber" varchar NOT NULL, "name" varchar NOT NULL)`);
        await queryRunner.query(`INSERT INTO "temporary_bank_account"("bankAccountId", "bankAccountNumber", "name") SELECT "bankAccountId", "bankAccountNumber", "name" FROM "bank_account"`);
        await queryRunner.query(`DROP TABLE "bank_account"`);
        await queryRunner.query(`ALTER TABLE "temporary_bank_account" RENAME TO "bank_account"`);
        await queryRunner.query(`CREATE TABLE "temporary_bank_account" ("bankAccountId" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "bankAccountNumber" varchar NOT NULL, "name" varchar NOT NULL, CONSTRAINT "UQ_6bff5cfa3e14015a10aa321f9ef" UNIQUE ("bankAccountNumber"))`);
        await queryRunner.query(`INSERT INTO "temporary_bank_account"("bankAccountId", "bankAccountNumber", "name") SELECT "bankAccountId", "bankAccountNumber", "name" FROM "bank_account"`);
        await queryRunner.query(`DROP TABLE "bank_account"`);
        await queryRunner.query(`ALTER TABLE "temporary_bank_account" RENAME TO "bank_account"`);
        await queryRunner.query(`CREATE TABLE "temporary_bank_transaction" ("bankTransactionId" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "date" text NOT NULL, "amount" integer NOT NULL, "note" varchar NOT NULL, "balance" integer, "calculatedBalance" integer, "userNote" varchar NOT NULL, "bankAccountBankAccountId" integer, "categoryCategoryId" integer, CONSTRAINT "FK_3383fd03b1fba77bf5aeb9383f4" FOREIGN KEY ("bankAccountBankAccountId") REFERENCES "bank_account" ("bankAccountId") ON DELETE CASCADE, CONSTRAINT "FK_db55b94d4cb02fe2e2f25508ece" FOREIGN KEY ("categoryCategoryId") REFERENCES "category" ("categoryId") ON DELETE SET NULL)`);
        await queryRunner.query(`INSERT INTO "temporary_bank_transaction"("bankTransactionId", "date", "amount", "note", "balance", "calculatedBalance", "userNote", "bankAccountBankAccountId", "categoryCategoryId") SELECT "bankTransactionId", "date", "amount", "note", "balance", "calculatedBalance", "userNote", "bankAccountBankAccountId", "categoryCategoryId" FROM "bank_transaction"`);
        await queryRunner.query(`DROP TABLE "bank_transaction"`);
        await queryRunner.query(`ALTER TABLE "temporary_bank_transaction" RENAME TO "bank_transaction"`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "bank_transaction" RENAME TO "temporary_bank_transaction"`);
        await queryRunner.query(`CREATE TABLE "bank_transaction" ("bankTransactionId" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "date" text NOT NULL, "amount" integer NOT NULL, "note" varchar NOT NULL, "balance" integer, "calculatedBalance" integer, "userNote" varchar NOT NULL, "bankAccountBankAccountId" integer, "categoryCategoryId" integer)`);
        await queryRunner.query(`INSERT INTO "bank_transaction"("bankTransactionId", "date", "amount", "note", "balance", "calculatedBalance", "userNote", "bankAccountBankAccountId", "categoryCategoryId") SELECT "bankTransactionId", "date", "amount", "note", "balance", "calculatedBalance", "userNote", "bankAccountBankAccountId", "categoryCategoryId" FROM "temporary_bank_transaction"`);
        await queryRunner.query(`DROP TABLE "temporary_bank_transaction"`);
        await queryRunner.query(`ALTER TABLE "bank_account" RENAME TO "temporary_bank_account"`);
        await queryRunner.query(`CREATE TABLE "bank_account" ("bankAccountId" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "bankAccountNumber" varchar NOT NULL, "name" varchar NOT NULL)`);
        await queryRunner.query(`INSERT INTO "bank_account"("bankAccountId", "bankAccountNumber", "name") SELECT "bankAccountId", "bankAccountNumber", "name" FROM "temporary_bank_account"`);
        await queryRunner.query(`DROP TABLE "temporary_bank_account"`);
        await queryRunner.query(`ALTER TABLE "bank_account" RENAME TO "temporary_bank_account"`);
        await queryRunner.query(`CREATE TABLE "bank_account" ("bankAccountId" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "bankAccountNumber" varchar NOT NULL, "name" varchar NOT NULL)`);
        await queryRunner.query(`INSERT INTO "bank_account"("bankAccountId", "bankAccountNumber", "name") SELECT "bankAccountId", "bankAccountNumber", "name" FROM "temporary_bank_account"`);
        await queryRunner.query(`DROP TABLE "temporary_bank_account"`);
        await queryRunner.query(`ALTER TABLE "bank_transaction" RENAME TO "temporary_bank_transaction"`);
        await queryRunner.query(`CREATE TABLE "bank_transaction" ("bankTransactionId" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "date" text NOT NULL, "amount" integer NOT NULL, "note" varchar NOT NULL, "balance" integer, "calculatedBalance" integer, "userNote" varchar NOT NULL, "bankAccountBankAccountId" integer, "categoryCategoryId" integer, CONSTRAINT "FK_db55b94d4cb02fe2e2f25508ece" FOREIGN KEY ("categoryCategoryId") REFERENCES "category" ("categoryId") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_3383fd03b1fba77bf5aeb9383f4" FOREIGN KEY ("bankAccountBankAccountId") REFERENCES "bank_account" ("bankAccountId") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "bank_transaction"("bankTransactionId", "date", "amount", "note", "balance", "calculatedBalance", "userNote", "bankAccountBankAccountId", "categoryCategoryId") SELECT "bankTransactionId", "date", "amount", "note", "balance", "calculatedBalance", "userNote", "bankAccountBankAccountId", "categoryCategoryId" FROM "temporary_bank_transaction"`);
        await queryRunner.query(`DROP TABLE "temporary_bank_transaction"`);
    }

}
