import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class CreateAttachmentTable1784985512571 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "attachment",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "originalName",
            type: "varchar",
          },
          {
            name: "key",
            type: "varchar",
          },
          {
            name: "url",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "mimetype",
            type: "varchar",
          },
          {
            name: "size",
            type: "bigint",
          },
          {
            name: "uploadedById",
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
      true,
    );

    // Foreign Key
    await queryRunner.createForeignKey(
      "attachment",
      new TableForeignKey({
        columnNames: ["uploadedById"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }),
    );

    await queryRunner.createIndex(
      "attachment",
      new TableIndex({
        name: "IDX_attachment_uploadedById",
        columnNames: ["uploadedById"],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("attachment", true);
  }
}