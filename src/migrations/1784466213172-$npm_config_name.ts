import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class $npmConfigName1784466213172 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ساخت جدول workspaces
    await queryRunner.createTable(
      new Table({
        name: "workspaces",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          { name: "name", type: "varchar", length: "120" },
          { name: "slug", type: "varchar", length: "150", isUnique: true },
          { name: "description", type: "text", isNullable: true },
          { name: "isActive", type: "boolean", default: true },
          { name: "ownerId", type: "int" },
          {
            name: "createdAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
          },
          { name: "deletedAt", type: "timestamp", isNullable: true },
        ],
      }),
      true,
    );

    // ساخت جدول workspace_members
    await queryRunner.createTable(
      new Table({
        name: "workspace_members",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          { name: "workspaceId", type: "int" },
          { name: "userId", type: "int" },
          {
            name: "role",
            type: "enum",
            enum: ["OWNER", "ADMIN", "MEMBER"],
            default: "'MEMBER'",
          },
          { name: "joinedAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      "workspaces",
      new TableForeignKey({
        name: "FK_workspaces_ownerId_final",
        columnNames: ["ownerId"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    );

    await queryRunner.createForeignKey(
      "workspace_members",
      new TableForeignKey({
        name: "FK_workspace_members_workspaceId_final",
        columnNames: ["workspaceId"],
        referencedTableName: "workspaces",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    );

    await queryRunner.createForeignKey(
      "workspace_members",
      new TableForeignKey({
        name: "FK_workspace_members_userId_final",
        columnNames: ["userId"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      "workspace_members",
      "FK_workspace_members_workspaceId_v2",
    );
    await queryRunner.dropForeignKey(
      "workspace_members",
      "FK_workspace_members_userId_v2",
    );
    await queryRunner.dropForeignKey("workspaces", "FK_workspaces_ownerId_v2");

    await queryRunner.dropTable("workspace_members");
    await queryRunner.dropTable("workspaces");
  }
}
