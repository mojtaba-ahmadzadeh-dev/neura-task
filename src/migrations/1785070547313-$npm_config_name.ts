import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateAutomationTable1785071000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'automation',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            unsigned: true,
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['recurring', 'reminder'],
          },
          {
            name: 'taskId',
            type: 'bigint',
            unsigned: true, // tasks.id = bigint unsigned
          },
          {
            name: 'userId',
            type: 'int',
          },
          {
            name: 'active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'workspaceId',
            type: 'int',
          },
          {
            name: 'daysOfWeek',
            type: 'text',
          },
          {
            name: 'timeOfDay',
            type: 'time',
          },
          {
            name: 'timezone',
            type: 'varchar',
            default: "'Asia/Tehran'",
          },
          {
            name: 'lastRunAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'nextRunAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Foreign Keys
    await queryRunner.createForeignKey(
      'automation',
      new TableForeignKey({
        name: 'FK_automation_taskId',
        columnNames: ['taskId'],
        referencedTableName: 'tasks',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'automation',
      new TableForeignKey({
        name: 'FK_automation_userId',
        columnNames: ['userId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'automation',
      new TableForeignKey({
        name: 'FK_automation_workspaceId',
        columnNames: ['workspaceId'],
        referencedTableName: 'workspaces',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Indexes
    await queryRunner.createIndex(
      'automation',
      new TableIndex({
        name: 'IDX_automation_taskId',
        columnNames: ['taskId'],
      }),
    );

    await queryRunner.createIndex(
      'automation',
      new TableIndex({
        name: 'IDX_automation_userId',
        columnNames: ['userId'],
      }),
    );

    await queryRunner.createIndex(
      'automation',
      new TableIndex({
        name: 'IDX_automation_workspaceId',
        columnNames: ['workspaceId'],
      }),
    );

    await queryRunner.createIndex(
      'automation',
      new TableIndex({
        name: 'IDX_automation_nextRunAt',
        columnNames: ['nextRunAt'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('automation', true);
  }
}
