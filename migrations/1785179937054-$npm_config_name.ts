import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateNotificationsTable1785179937054 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'notifications',
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
            name: 'receiverId',
            type: 'int',
          },
          {
            name: 'senderId',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'enum',
            enum: [
              'INFO',
              'SUCCESS',
              'WARNING',
              'ERROR',
              'TASK_CREATED',
              'TASK_UPDATED',
              'TASK_ASSIGNED',
              'TASK_COMPLETED',
              'TASK_OVERDUE',
              'TASK_COMMENTED',
              'TASK_MENTIONED',
              'WORKSPACE_INVITED',
              'WORKSPACE_MEMBER_JOINED',
              'WORKSPACE_MEMBER_REMOVED',
              'PROJECT_CREATED',
              'PROJECT_ARCHIVED',
              'PROJECT_INVITED',
              'AUTOMATION_EXECUTED',
              'AUTOMATION_FAILED',
              'ATTACHMENT_UPLOADED',
              'COMMENT_REPLY',
            ],
          },
          {
            name: 'title',
            type: 'varchar',
            length: '150',
          },
          {
            name: 'message',
            type: 'text',
          },
          {
            name: 'resourceType',
            type: 'enum',
            enum: ['TASK', 'PROJECT', 'WORKSPACE', 'COMMENT', 'ATTACHMENT', 'AUTOMATION', 'USER'],
            isNullable: true,
          },
          {
            name: 'resourceId',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'isRead',
            type: 'boolean',
            default: false,
          },
          {
            name: 'readAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'isArchived',
            type: 'boolean',
            default: false,
          },
          {
            name: 'actionUrl',
            type: 'varchar',
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
      'notifications',
      new TableForeignKey({
        name: 'FK_notifications_receiverId',
        columnNames: ['receiverId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'notifications',
      new TableForeignKey({
        name: 'FK_notifications_senderId',
        columnNames: ['senderId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    // Indexes
    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'IDX_notifications_receiverId',
        columnNames: ['receiverId'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('notifications', true);
  }
}
