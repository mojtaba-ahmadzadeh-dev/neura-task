import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class $npmConfigName1784057799614 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ====== ۱. ایجاد جدول permissions ======
    const permissionsTableExists = await queryRunner.hasTable("permissions");
    if (!permissionsTableExists) {
      await queryRunner.createTable(
        new Table({
          name: "permissions",
          columns: [
            {
              name: "id",
              type: "int",
              isPrimary: true,
              isGenerated: true,
              generationStrategy: "increment",
            },
            {
              name: "name",
              type: "varchar",
              length: "255",
              isUnique: true,
              isNullable: false,
            },
            {
              name: "description",
              type: "text",
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
              onUpdate: "CURRENT_TIMESTAMP",
            },
          ],
        }),
        true,
      );
    }

    // ====== ۲. ایجاد ایندکس روی name در جدول permissions ======
    const permissionsTable = await queryRunner.getTable("permissions");
    if (permissionsTable) {
      const existingIndex = permissionsTable.indices.find(idx => idx.name === "IDX_PERMISSION_NAME");
      if (!existingIndex) {
        await queryRunner.createIndex(
          "permissions",
          new TableIndex({
            name: "IDX_PERMISSION_NAME",
            columnNames: ["name"],
          }),
        );
      }
    }

    const rolesTableExists = await queryRunner.hasTable("roles");
    if (!rolesTableExists) {
      await queryRunner.createTable(
        new Table({
          name: "roles",
          columns: [
            {
              name: "id",
              type: "int",
              isPrimary: true,
              isGenerated: true,
              generationStrategy: "increment",
            },
            {
              name: "name",
              type: "varchar",
              length: "255",
              isUnique: true,
              isNullable: false,
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
              onUpdate: "CURRENT_TIMESTAMP",
            },
          ],
        }),
        true,
      );
    }

    const rolesTable = await queryRunner.getTable("roles");
    if (rolesTable) {
      const existingIndex = rolesTable.indices.find(idx => idx.name === "IDX_ROLE_NAME");
      if (!existingIndex) {
        await queryRunner.createIndex(
          "roles",
          new TableIndex({
            name: "IDX_ROLE_NAME",
            columnNames: ["name"],
          }),
        );
      }
    }

    const rolePermissionsTableExists = await queryRunner.hasTable("role_permissions");
    if (!rolePermissionsTableExists) {
      await queryRunner.createTable(
        new Table({
          name: "role_permissions",
          columns: [
            {
              name: "roleId",
              type: "int",
              isPrimary: true,
              isNullable: false,
            },
            {
              name: "permissionId",
              type: "int",
              isPrimary: true,
              isNullable: false,
            },
          ],
          foreignKeys: [
            {
              columnNames: ["roleId"],
              referencedTableName: "roles",
              referencedColumnNames: ["id"],
              onDelete: "CASCADE",
            },
            {
              columnNames: ["permissionId"],
              referencedTableName: "permissions",
              referencedColumnNames: ["id"],
              onDelete: "CASCADE",
            },
          ],
          indices: [
            {
              name: "IDX_ROLE_PERMISSIONS_ROLE",
              columnNames: ["roleId"],
            },
            {
              name: "IDX_ROLE_PERMISSIONS_PERMISSION",
              columnNames: ["permissionId"],
            },
          ],
        }),
        true,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable("role_permissions")) {
      await queryRunner.dropTable("role_permissions", true);
    }
    if (await queryRunner.hasTable("permissions")) {
      await queryRunner.dropTable("permissions", true);
    }
    if (await queryRunner.hasTable("roles")) {
      await queryRunner.dropTable("roles", true);
    }
  }
}