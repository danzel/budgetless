import {MigrationInterface, QueryRunner} from "typeorm";

export class AddUniqueConstraints1532937490673 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
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
    }

}
