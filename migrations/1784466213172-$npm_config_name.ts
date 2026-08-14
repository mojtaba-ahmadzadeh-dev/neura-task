import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class $npmConfigName1784466213172 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ساخت جدول workspaces (اگه از قبل نبود)
    const workspacesTable = await queryRunner.getTable('workspaces');
    if (!workspacesTable) {
      await queryRunner.createTable(
        new Table({
          name: 'workspaces',
          columns: [
            {
              name: 'id',
              type: 'int',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            { name: 'name', type: 'varchar', length: '120' },
            { name: 'slug', type: 'varchar', length: '150', isUnique: true },
            { name: 'description', type: 'text', isNullable: true },
            { name: 'isActive', type: 'boolean', default: true },
            { name: 'ownerId', type: 'int' },
            {
              name: 'createdAt',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
            },
            {
              name: 'updatedAt',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
              onUpdate: 'CURRENT_TIMESTAMP',
            },
            { name: 'deletedAt', type: 'timestamp', isNullable: true },
          ],
        }),
        true,
      );
    }

    // ساخت جدول workspace_members (اگه از قبل نبود)
    const workspaceMembersTable = await queryRunner.getTable('workspace_members');
    if (!workspaceMembersTable) {
      await queryRunner.createTable(
        new Table({
          name: 'workspace_members',
          columns: [
            {
              name: 'id',
              type: 'int',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            { name: 'workspaceId', type: 'int' },
            { name: 'userId', type: 'int' },
            {
              name: 'role',
              type: 'enum',
              enum: ['OWNER', 'ADMIN', 'MEMBER'],
              default: "'MEMBER'",
            },
            {
              name: 'joinedAt',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
            },
          ],
        }),
        true,
      );
    }

    // چک کن جدول workspaces این FK رو داره یا نه
    const workspacesTableForFk = await queryRunner.getTable('workspaces');
    const hasOwnerFk = workspacesTableForFk?.foreignKeys.some(
      (fk) => fk.name === 'FK_workspaces_ownerId_final',
    );
    if (!hasOwnerFk) {
      await queryRunner.createForeignKey(
        'workspaces',
        new TableForeignKey({
          name: 'FK_workspaces_ownerId_final',
          columnNames: ['ownerId'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      );
    }

    // چک کن جدول workspace_members این دو FK رو داره یا نه
    const workspaceMembersTableForFk = await queryRunner.getTable('workspace_members');

    const hasWorkspaceIdFk = workspaceMembersTableForFk?.foreignKeys.some(
      (fk) => fk.name === 'FK_workspace_members_workspaceId_final',
    );
    if (!hasWorkspaceIdFk) {
      await queryRunner.createForeignKey(
        'workspace_members',
        new TableForeignKey({
          name: 'FK_workspace_members_workspaceId_final',
          columnNames: ['workspaceId'],
          referencedTableName: 'workspaces',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      );
    }

    const hasUserIdFk = workspaceMembersTableForFk?.foreignKeys.some(
      (fk) => fk.name === 'FK_workspace_members_userId_final',
    );
    if (!hasUserIdFk) {
      await queryRunner.createForeignKey(
        'workspace_members',
        new TableForeignKey({
          name: 'FK_workspace_members_userId_final',
          columnNames: ['userId'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const workspaceMembersTable = await queryRunner.getTable('workspace_members');
    if (workspaceMembersTable) {
      const workspaceIdFk = workspaceMembersTable.foreignKeys.find(
        (fk) => fk.name === 'FK_workspace_members_workspaceId_final',
      );
      if (workspaceIdFk) {
        await queryRunner.dropForeignKey('workspace_members', workspaceIdFk);
      }

      const userIdFk = workspaceMembersTable.foreignKeys.find(
        (fk) => fk.name === 'FK_workspace_members_userId_final',
      );
      if (userIdFk) {
        await queryRunner.dropForeignKey('workspace_members', userIdFk);
      }
    }

    const workspacesTable = await queryRunner.getTable('workspaces');
    if (workspacesTable) {
      const ownerIdFk = workspacesTable.foreignKeys.find(
        (fk) => fk.name === 'FK_workspaces_ownerId_final',
      );
      if (ownerIdFk) {
        await queryRunner.dropForeignKey('workspaces', ownerIdFk);
      }
    }

    await queryRunner.dropTable('workspace_members', true);
    await queryRunner.dropTable('workspaces', true);
  }
}
