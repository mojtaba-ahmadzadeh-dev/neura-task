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
            { name: "id", type: "int", isPrimary: true },
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

    const projectsTableForIndex = await queryRunner.getTable("projects");
    const hasTitleIndex = projectsTableForIndex?.indices.some(
      (idx) => idx.name === "IDX_projects_title",
    );
    if (!hasTitleIndex) {
      await queryRunner.createIndex(
        "projects",
        new TableIndex({
          name: "IDX_projects_title",
          columnNames: ["title"],
        }),
      );
    }

    const projectsTableForFk = await queryRunner.getTable("projects");
    const hasOwnerFk = projectsTableForFk?.foreignKeys.some(
      (fk) => fk.name === "FK_projects_ownerId",
    );
    if (!hasOwnerFk) {
      await queryRunner.createForeignKey(
        "projects",
        new TableForeignKey({
          name: "FK_projects_ownerId",
          columnNames: ["ownerId"],
          referencedTableName: "users",
          referencedColumnNames: ["id"],
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        }),
      );
    }

    const projectMembersTable = await queryRunner.getTable("project_members");
    if (!projectMembersTable) {
      await queryRunner.createTable(
        new Table({
          name: "project_members",
          columns: [
            { name: "projectId", type: "integer", isPrimary: true },
            { name: "userId", type: "integer", isPrimary: true },
          ],
        }),
        true,
      );
    }

    const projectMembersTableForFk = await queryRunner.getTable("project_members");

    const hasProjectIdFk = projectMembersTableForFk?.foreignKeys.some(
      (fk) => fk.name === "FK_project_members_projectId",
    );
    if (!hasProjectIdFk) {
      await queryRunner.createForeignKey(
        "project_members",
        new TableForeignKey({
          name: "FK_project_members_projectId",
          columnNames: ["projectId"],
          referencedTableName: "projects",
          referencedColumnNames: ["id"],
          onDelete: "CASCADE",
        }),
      );
    }

    const hasUserIdFk = projectMembersTableForFk?.foreignKeys.some(
      (fk) => fk.name === "FK_project_members_userId",
    );
    if (!hasUserIdFk) {
      await queryRunner.createForeignKey(
        "project_members",
        new TableForeignKey({
          name: "FK_project_members_userId",
          columnNames: ["userId"],
          referencedTableName: "users",
          referencedColumnNames: ["id"],
          onDelete: "CASCADE",
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("project_members", true);
    await queryRunner.dropTable("projects", true);
  }
}