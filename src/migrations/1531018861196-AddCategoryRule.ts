import {MigrationInterface, QueryRunner} from "typeorm";

export class AddCategoryRule1531018861196 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "temporary_bank_transaction" ("bankTransactionId" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "date" text NOT NULL, "amount" integer NOT NULL, "description" varchar NOT NULL, "balance" integer, "calculatedBalance" integer, "userNote" varchar NOT NULL, "bankAccountBankAccountId" integer, "categoryCategoryId" integer, CONSTRAINT "FK_db55b94d4cb02fe2e2f25508ece" FOREIGN KEY ("categoryCategoryId") REFERENCES "category" ("categoryId") ON DELETE SET NULL ON UPDATE NO ACTION, CONSTRAINT "FK_3383fd03b1fba77bf5aeb9383f4" FOREIGN KEY ("bankAccountBankAccountId") REFERENCES "bank_account" ("bankAccountId") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_bank_transaction"("bankTransactionId", "date", "amount", "description", "balance", "calculatedBalance", "userNote", "bankAccountBankAccountId", "categoryCategoryId") SELECT "bankTransactionId", "date", "amount", "note", "balance", "calculatedBalance", "userNote", "bankAccountBankAccountId", "categoryCategoryId" FROM "bank_transaction"`);
        await queryRunner.query(`DROP TABLE "bank_transaction"`);
        await queryRunner.query(`ALTER TABLE "temporary_bank_transaction" RENAME TO "bank_transaction"`);
        await queryRunner.query(`CREATE TABLE "category_rule" ("categoryRuleId" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "descriptionContains" varchar NOT NULL, "categoryCategoryId" integer)`);
        await queryRunner.query(`CREATE TABLE "temporary_category_rule" ("categoryRuleId" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "descriptionContains" varchar NOT NULL, "categoryCategoryId" integer, CONSTRAINT "FK_3ad9e360ea83082503cb1619a21" FOREIGN KEY ("categoryCategoryId") REFERENCES "category" ("categoryId") ON DELETE CASCADE)`);
        await queryRunner.query(`INSERT INTO "temporary_category_rule"("categoryRuleId", "descriptionContains", "categoryCategoryId") SELECT "categoryRuleId", "descriptionContains", "categoryCategoryId" FROM "category_rule"`);
        await queryRunner.query(`DROP TABLE "category_rule"`);
        await queryRunner.query(`ALTER TABLE "temporary_category_rule" RENAME TO "category_rule"`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "category_rule" RENAME TO "temporary_category_rule"`);
        await queryRunner.query(`CREATE TABLE "category_rule" ("categoryRuleId" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "descriptionContains" varchar NOT NULL, "categoryCategoryId" integer)`);
        await queryRunner.query(`INSERT INTO "category_rule"("categoryRuleId", "descriptionContains", "categoryCategoryId") SELECT "categoryRuleId", "descriptionContains", "categoryCategoryId" FROM "temporary_category_rule"`);
        await queryRunner.query(`DROP TABLE "temporary_category_rule"`);
        await queryRunner.query(`DROP TABLE "category_rule"`);
        await queryRunner.query(`ALTER TABLE "bank_transaction" RENAME TO "temporary_bank_transaction"`);
        await queryRunner.query(`CREATE TABLE "bank_transaction" ("bankTransactionId" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "date" text NOT NULL, "amount" integer NOT NULL, "note" varchar NOT NULL, "balance" integer, "calculatedBalance" integer, "userNote" varchar NOT NULL, "bankAccountBankAccountId" integer, "categoryCategoryId" integer, CONSTRAINT "FK_db55b94d4cb02fe2e2f25508ece" FOREIGN KEY ("categoryCategoryId") REFERENCES "category" ("categoryId") ON DELETE SET NULL ON UPDATE NO ACTION, CONSTRAINT "FK_3383fd03b1fba77bf5aeb9383f4" FOREIGN KEY ("bankAccountBankAccountId") REFERENCES "bank_account" ("bankAccountId") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "bank_transaction"("bankTransactionId", "date", "amount", "note", "balance", "calculatedBalance", "userNote", "bankAccountBankAccountId", "categoryCategoryId") SELECT "bankTransactionId", "date", "amount", "description", "balance", "calculatedBalance", "userNote", "bankAccountBankAccountId", "categoryCategoryId" FROM "temporary_bank_transaction"`);
        await queryRunner.query(`DROP TABLE "temporary_bank_transaction"`);
    }

}
