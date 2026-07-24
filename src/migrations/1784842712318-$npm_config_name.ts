import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateCommentsTable1784842712318 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("comments", true);

    await queryRunner.createTable(
      new Table({
        name: "comments",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "content",
            type: "text",
          },
          {
            name: "taskId",
            type: "int",
            isNullable: false,
          },
          {
            name: "userId",
            type: "int",
            isNullable: false,
          },
          {
            name: "parentId",
            type: "int",
            isNullable: true,
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true
    );

    // فقط ایندکس
    await queryRunner.createIndex("comments", new TableIndex({
      name: "IDX_comments_taskId",
      columnNames: ["taskId"],
    }));

    await queryRunner.createIndex("comments", new TableIndex({
      name: "IDX_comments_userId",
      columnNames: ["userId"],
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("comments", true);
  }
}