import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class CreateProjectsTable1784661936724 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const projectsTable = await queryRunner.getTable("projects");
    if (!projectsTable) {
      await queryRunner.createTable(
        new Table({
          name: "projects",
          columns: [
            {
              name: "id",
              type: "int",
              isPrimary: true,
              isGenerated: true,
              generationStrategy: "increment",
            },
            { name: "title", type: "varchar", length: "255" },
            { name: "description", type: "text", isNullable: true },
            {
              name: "status",
              type: "enum",
              enum: ["active", "on_hold", "completed", "archived", "cancelled"],
              default: "'active'",
            },
            { name: "color", type: "varchar", length: "7", isNullable: true },
            { name: "icon", type: "varchar", length: "100", isNullable: true },
            { name: "coverImage", type: "varchar", isNullable: true },
            { name: "startDate", type: "timestamp", isNullable: true },
            { name: "endDate", type: "timestamp", isNullable: true },
            { name: "dueDate", type: "timestamp", isNullable: true },
            { name: "ownerId", type: "integer", isNullable: false },
            { name: "settings", type: "json", isNullable: true },
            { name: "taskCount", type: "integer", default: 0 },
            { name: "completedTaskCount", type: "integer", default: 0 },
            { name: "progress", type: "decimal", precision: 5, scale: 2, default: 0 },
            { name: "createdAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
            { name: "updatedAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
            { name: "deletedAt", type: "timestamp", isNullable: true },
          ],
        }),
        true,
      );
    }

    // ==================== ایجاد جدول project_members (جدول واسط) ====================
    const projectMembersTable = await queryRunner.getTable("project_members");
    if (!projectMembersTable) {
      await queryRunner.createTable(
        new Table({
          name: "project_members",
          columns: [
            { name: "projectId", type: "int", isPrimary: true },
            { name: "userId", type: "int", isPrimary: true },
          ],
        }),
        true,
      );
    }

    // Foreign Keys برای project_members
    const hasProjectFk = (await queryRunner.getTable("project_members"))?.foreignKeys.some(
      (fk) => fk.columnNames.includes("projectId")
    );
    if (!hasProjectFk) {
      await queryRunner.createForeignKey(
        "project_members",
        new TableForeignKey({
          columnNames: ["projectId"],
          referencedTableName: "projects",
          referencedColumnNames: ["id"],
          onDelete: "CASCADE",
        })
      );
    }

    const hasUserFk = (await queryRunner.getTable("project_members"))?.foreignKeys.some(
      (fk) => fk.columnNames.includes("userId")
    );
    if (!hasUserFk) {
      await queryRunner.createForeignKey(
        "project_members",
        new TableForeignKey({
          columnNames: ["userId"],
          referencedTableName: "users",
          referencedColumnNames: ["id"],
          onDelete: "CASCADE",
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("project_members", true);
    await queryRunner.dropTable("projects", true);
  }
}