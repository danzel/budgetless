import {MigrationInterface, QueryRunner} from "typeorm";

export class AddBudget1533623403755 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP INDEX "IDX_457399f062a410a7737f6a4bd7"`);
        await queryRunner.query(`DROP INDEX "IDX_23c05c292c439d77b0de816b50"`);
        await queryRunner.query(`DROP INDEX "IDX_0737486aaa76bd3903f77fa757"`);
        await queryRunner.query(`DROP INDEX "IDX_058c82325f15293ca25cbd70e5"`);
        await queryRunner.query(`CREATE TABLE "budget" ("budgetId" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL)`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_2fdb3d17711251c075e7ea1ffc" ON "budget" ("name") `);
        await queryRunner.query(`CREATE TABLE "budget_category" ("budgetCategoryId" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "amount" integer NOT NULL, "note" varchar NOT NULL, "budgetBudgetId" integer, "categoryCategoryId" integer)`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_457399f062a410a7737f6a4bd7" ON "category_rule" ("descriptionContains") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_23c05c292c439d77b0de816b50" ON "category" ("name") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_058c82325f15293ca25cbd70e5" ON "bank_account" ("bankAccountNumber") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_0737486aaa76bd3903f77fa757" ON "bank_account" ("name") `);
        await queryRunner.query(`CREATE TABLE "temporary_budget_category" ("budgetCategoryId" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "amount" integer NOT NULL, "note" varchar NOT NULL, "budgetBudgetId" integer, "categoryCategoryId" integer, CONSTRAINT "FK_fda5a4b8062a3b54f3f921347d5" FOREIGN KEY ("budgetBudgetId") REFERENCES "budget" ("budgetId") ON DELETE CASCADE, CONSTRAINT "FK_38d8578b5e3b73b086ccf66cd63" FOREIGN KEY ("categoryCategoryId") REFERENCES "category" ("categoryId") ON DELETE CASCADE)`);
        await queryRunner.query(`INSERT INTO "temporary_budget_category"("budgetCategoryId", "amount", "note", "budgetBudgetId", "categoryCategoryId") SELECT "budgetCategoryId", "amount", "note", "budgetBudgetId", "categoryCategoryId" FROM "budget_category"`);
        await queryRunner.query(`DROP TABLE "budget_category"`);
        await queryRunner.query(`ALTER TABLE "temporary_budget_category" RENAME TO "budget_category"`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "budget_category" RENAME TO "temporary_budget_category"`);
        await queryRunner.query(`CREATE TABLE "budget_category" ("budgetCategoryId" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "amount" integer NOT NULL, "note" varchar NOT NULL, "budgetBudgetId" integer, "categoryCategoryId" integer)`);
        await queryRunner.query(`INSERT INTO "budget_category"("budgetCategoryId", "amount", "note", "budgetBudgetId", "categoryCategoryId") SELECT "budgetCategoryId", "amount", "note", "budgetBudgetId", "categoryCategoryId" FROM "temporary_budget_category"`);
        await queryRunner.query(`DROP TABLE "temporary_budget_category"`);
        await queryRunner.query(`DROP INDEX "IDX_0737486aaa76bd3903f77fa757"`);
        await queryRunner.query(`DROP INDEX "IDX_058c82325f15293ca25cbd70e5"`);
        await queryRunner.query(`DROP INDEX "IDX_23c05c292c439d77b0de816b50"`);
        await queryRunner.query(`DROP INDEX "IDX_457399f062a410a7737f6a4bd7"`);
        await queryRunner.query(`DROP TABLE "budget_category"`);
        await queryRunner.query(`DROP INDEX "IDX_2fdb3d17711251c075e7ea1ffc"`);
        await queryRunner.query(`DROP TABLE "budget"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_058c82325f15293ca25cbd70e5" ON "bank_account" ("bankAccountNumber") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_0737486aaa76bd3903f77fa757" ON "bank_account" ("name") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_23c05c292c439d77b0de816b50" ON "category" ("name") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_457399f062a410a7737f6a4bd7" ON "category_rule" ("descriptionContains") `);
    }

}
