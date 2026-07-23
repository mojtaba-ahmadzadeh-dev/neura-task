import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class CreateProjectsTable1784726927076 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const projectsTable = await queryRunner.getTable("projects");

    if (!projectsTable) {
      await queryRunner.createTable(
        new Table({
          name: "projects",
          columns: [
            {
              name: "id",
              type: "serial",
              isPrimary: true,
            },
            {
              name: "title",
              type: "varchar",
              length: "255",
            },
            {
              name: "description",
              type: "text",
              isNullable: true,
            },
            {
              name: "createBy",
              type: "integer",
            },
            {
              name: "workspaceId",
              type: "integer",
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
    }

    // چک کن ایندکس title وجود داره یا نه
    const projectsTableForIndex = await queryRunner.getTable("projects");
    const hasTitleIndex = projectsTableForIndex?.indices.some(
      (index) => index.name === "IDX_projects_title"
    );

    if (!hasTitleIndex) {
      await queryRunner.createIndex(
        "projects",
        new TableIndex({
          name: "IDX_projects_title",
          columnNames: ["title"],
        })
      );
    }

    // چک کن ستون workspaceId از قبل هست یا نه (اگر جدول از قبل وجود داشته)
    const projectsTableForColumn = await queryRunner.getTable("projects");
    const hasWorkspaceIdColumn = projectsTableForColumn?.columns.some(
      (col) => col.name === "workspaceId"
    );

    if (!hasWorkspaceIdColumn && projectsTableForColumn) {
      await queryRunner.addColumn(
        "projects",
        new TableColumn({
          name: "workspaceId",
          type: "integer",
          isNullable: false,
        })
      );
    }

    // چک کن FK workspace از قبل هست یا نه
    const projectsTableForFk = await queryRunner.getTable("projects");
    const hasWorkspaceFk = projectsTableForFk?.foreignKeys.some(
      (fk) => fk.name === "FK_projects_workspaceId"
    );

    if (!hasWorkspaceFk && projectsTableForFk) {
      await queryRunner.createForeignKey(
        "projects",
        new TableForeignKey({
          name: "FK_projects_workspaceId",
          columnNames: ["workspaceId"],
          referencedTableName: "workspaces", // فرض می‌کنم اسم جدول workspace ها workspaces هست
          referencedColumnNames: ["id"],
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const projectsTable = await queryRunner.getTable("projects");

    if (projectsTable) {
      // حذف FK
      const workspaceFk = projectsTable.foreignKeys.find(
        (fk) => fk.name === "FK_projects_workspaceId"
      );
      if (workspaceFk) {
        await queryRunner.dropForeignKey("projects", workspaceFk);
      }

      // حذف ایندکس
      const titleIndex = projectsTable.indices.find(
        (index) => index.name === "IDX_projects_title"
      );
      if (titleIndex) {
        await queryRunner.dropIndex("projects", titleIndex);
      }

      // حذف ستون workspaceId (اگه جدا از جدول اصلی اضافه شده بود)
      const hasWorkspaceIdColumn = projectsTable.columns.some(
        (col) => col.name === "workspaceId"
      );
      if (hasWorkspaceIdColumn) {
        await queryRunner.dropColumn("projects", "workspaceId");
      }
    }

    // حذف کل جدول
    await queryRunner.dropTable("projects", true);
  }
}