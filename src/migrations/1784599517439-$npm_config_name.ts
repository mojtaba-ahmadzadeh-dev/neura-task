import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class CreateTasksTable1784599517439 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "tasks",
        columns: [
          {
            name: "id",
            type: "serial",
            isPrimary: true,
          },
          {
            name: "title",
            type: "varchar",
            length: "150",
          },
          {
            name: "description",
            type: "text",
            isNullable: true,
          },
          {
            name: "status",
            type: "enum",
            enum: ["TODO", "IN_PROGRESS", "DONE"],
            default: "'TODO'",
          },
          {
            name: "priority",
            type: "enum",
            enum: ["LOW", "MEDIUM", "HIGH"],
            default: "'MEDIUM'",
          },
          {
            name: "dueDate",
            type: "date",
            isNullable: true,
          },
          {
            name: "isCompleted",
            type: "boolean",
            default: false,
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

    await queryRunner.addColumn(
      "tasks",
      new TableColumn({
        name: "assignee_id",
        type: "integer",
        isNullable: true,
      }),
    );

    // ۲. اضافه کردن Foreign Key با نام منحصر به فرد
    await queryRunner.createForeignKey(
      "tasks",
      new TableForeignKey({
        name: "FK_tasks_assignee_id", // این نام مهم است و نباید تکراری باشد
        columnNames: ["assignee_id"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey("tasks", "FK_tasks_assignee_id");
    await queryRunner.dropColumn("tasks", "assignee_id");
  }
}
