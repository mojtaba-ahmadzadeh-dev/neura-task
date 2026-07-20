import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class $npmConfigName1784573414853 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "notifications",
        columns: [
          {
            name: "id",
            type: "serial",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "userId",
            type: "integer",
            isNullable: false,
          },
          {
            name: "title",
            type: "varchar",
            length: "150",
            isNullable: false,
          },
          {
            name: "message",
            type: "text",
            isNullable: false,
          },
          {
            name: "type",
            type: "enum",
            enum: ["SYSTEM", "ORDER", "PAYMENT", "MESSAGE", "WARNING"],
            default: "'SYSTEM'",
          },
          {
            name: "isRead",
            type: "boolean",
            default: false,
          },
          {
            name: "data",
            type: "json",
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
      true,
    );

    await queryRunner.createIndex(
      "notifications",
      new TableIndex({
        name: "IDX_notifications_userId",
        columnNames: ["userId"],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex("notifications", "IDX_notifications_userId");

    await queryRunner.dropTable("notifications");
  }
}
