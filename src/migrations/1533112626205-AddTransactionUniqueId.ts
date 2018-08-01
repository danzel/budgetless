import {MigrationInterface, QueryRunner} from "typeorm";

export class AddTransactionUniqueId1533112626205 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP INDEX "IDX_457399f062a410a7737f6a4bd7"`);
        await queryRunner.query(`DROP INDEX "IDX_23c05c292c439d77b0de816b50"`);
        await queryRunner.query(`DROP INDEX "IDX_0737486aaa76bd3903f77fa757"`);
        await queryRunner.query(`DROP INDEX "IDX_058c82325f15293ca25cbd70e5"`);
        await queryRunner.query(`CREATE TABLE "temporary_bank_transaction" ("bankTransactionId" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "date" text NOT NULL, "amount" integer NOT NULL, "description" varchar NOT NULL, "balance" integer NOT NULL, "userNote" varchar NOT NULL, "bankAccountBankAccountId" integer, "categoryCategoryId" integer, "importFileImportFileId" integer, "uniqueId" varchar NOT NULL, CONSTRAINT "FK_3383fd03b1fba77bf5aeb9383f4" FOREIGN KEY ("bankAccountBankAccountId") REFERENCES "bank_account" ("bankAccountId") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_db55b94d4cb02fe2e2f25508ece" FOREIGN KEY ("categoryCategoryId") REFERENCES "category" ("categoryId") ON DELETE SET NULL ON UPDATE NO ACTION, CONSTRAINT "FK_abfdf9d307d0392f9e5ce49816b" FOREIGN KEY ("importFileImportFileId") REFERENCES "import_file" ("importFileId") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_bank_transaction"("bankTransactionId", "date", "amount", "description", "balance", "userNote", "bankAccountBankAccountId", "categoryCategoryId", "importFileImportFileId") SELECT "bankTransactionId", "date", "amount", "description", "balance", "userNote", "bankAccountBankAccountId", "categoryCategoryId", "importFileImportFileId" FROM "bank_transaction"`);
        await queryRunner.query(`DROP TABLE "bank_transaction"`);
        await queryRunner.query(`ALTER TABLE "temporary_bank_transaction" RENAME TO "bank_transaction"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_457399f062a410a7737f6a4bd7" ON "category_rule" ("descriptionContains") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_23c05c292c439d77b0de816b50" ON "category" ("name") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_058c82325f15293ca25cbd70e5" ON "bank_account" ("bankAccountNumber") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_0737486aaa76bd3903f77fa757" ON "bank_account" ("name") `);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP INDEX "IDX_0737486aaa76bd3903f77fa757"`);
        await queryRunner.query(`DROP INDEX "IDX_058c82325f15293ca25cbd70e5"`);
        await queryRunner.query(`DROP INDEX "IDX_23c05c292c439d77b0de816b50"`);
        await queryRunner.query(`DROP INDEX "IDX_457399f062a410a7737f6a4bd7"`);
        await queryRunner.query(`ALTER TABLE "bank_transaction" RENAME TO "temporary_bank_transaction"`);
        await queryRunner.query(`CREATE TABLE "bank_transaction" ("bankTransactionId" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "date" text NOT NULL, "amount" integer NOT NULL, "description" varchar NOT NULL, "balance" integer NOT NULL, "userNote" varchar NOT NULL, "bankAccountBankAccountId" integer, "categoryCategoryId" integer, "importFileImportFileId" integer, CONSTRAINT "FK_3383fd03b1fba77bf5aeb9383f4" FOREIGN KEY ("bankAccountBankAccountId") REFERENCES "bank_account" ("bankAccountId") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_db55b94d4cb02fe2e2f25508ece" FOREIGN KEY ("categoryCategoryId") REFERENCES "category" ("categoryId") ON DELETE SET NULL ON UPDATE NO ACTION, CONSTRAINT "FK_abfdf9d307d0392f9e5ce49816b" FOREIGN KEY ("importFileImportFileId") REFERENCES "import_file" ("importFileId") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "bank_transaction"("bankTransactionId", "date", "amount", "description", "balance", "userNote", "bankAccountBankAccountId", "categoryCategoryId", "importFileImportFileId") SELECT "bankTransactionId", "date", "amount", "description", "balance", "userNote", "bankAccountBankAccountId", "categoryCategoryId", "importFileImportFileId" FROM "temporary_bank_transaction"`);
        await queryRunner.query(`DROP TABLE "temporary_bank_transaction"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_058c82325f15293ca25cbd70e5" ON "bank_account" ("bankAccountNumber") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_0737486aaa76bd3903f77fa757" ON "bank_account" ("name") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_23c05c292c439d77b0de816b50" ON "category" ("name") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_457399f062a410a7737f6a4bd7" ON "category_rule" ("descriptionContains") `);
    }

}
