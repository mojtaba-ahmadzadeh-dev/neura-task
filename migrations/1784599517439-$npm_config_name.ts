import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from 'typeorm';

export class CreateTasksTable1784599517439 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tasksTable = await queryRunner.getTable('tasks');

    if (!tasksTable) {
      await queryRunner.createTable(
        new Table({
          name: 'tasks',
          columns: [
            {
              name: 'id',
              type: 'serial',
              isPrimary: true,
            },
            {
              name: 'title',
              type: 'varchar',
              length: '150',
            },
            {
              name: 'description',
              type: 'text',
              isNullable: true,
            },
            {
              name: 'status',
              type: 'enum',
              enum: ['TODO', 'IN_PROGRESS', 'DONE'],
              default: "'TODO'",
            },
            {
              name: 'priority',
              type: 'enum',
              enum: ['LOW', 'MEDIUM', 'HIGH'],
              default: "'MEDIUM'",
            },
            {
              name: 'dueDate',
              type: 'date',
              isNullable: true,
            },
            {
              name: 'isCompleted',
              type: 'boolean',
              default: false,
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
    }

    // چک کن ستون assignee_id از قبل هست یا نه
    const tasksTableForColumn = await queryRunner.getTable('tasks');
    const hasAssigneeColumn = tasksTableForColumn?.columns.some(
      (col) => col.name === 'assignee_id',
    );

    if (!hasAssigneeColumn) {
      await queryRunner.addColumn(
        'tasks',
        new TableColumn({
          name: 'assignee_id',
          type: 'integer',
          isNullable: true,
        }),
      );
    }

    // چک کن FK از قبل هست یا نه
    const tasksTableForFk = await queryRunner.getTable('tasks');
    const hasAssigneeFk = tasksTableForFk?.foreignKeys.some(
      (fk) => fk.name === 'FK_tasks_assignee_id',
    );

    if (!hasAssigneeFk) {
      await queryRunner.createForeignKey(
        'tasks',
        new TableForeignKey({
          name: 'FK_tasks_assignee_id',
          columnNames: ['assignee_id'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tasksTable = await queryRunner.getTable('tasks');
    if (tasksTable) {
      const assigneeFk = tasksTable.foreignKeys.find((fk) => fk.name === 'FK_tasks_assignee_id');
      if (assigneeFk) {
        await queryRunner.dropForeignKey('tasks', assigneeFk);
      }

      const hasAssigneeColumn = tasksTable.columns.some((col) => col.name === 'assignee_id');
      if (hasAssigneeColumn) {
        await queryRunner.dropColumn('tasks', 'assignee_id');
      }
    }

    await queryRunner.dropTable('tasks', true);
  }
}
