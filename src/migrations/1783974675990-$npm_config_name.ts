import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class InitialMigration1783974675990 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const rolesTableExists = await queryRunner.hasTable('roles');
    if (!rolesTableExists) {
      await queryRunner.createTable(
        new Table({
          name: 'roles',
          columns: [
            {
              name: 'id',
              type: 'int',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            {
              name: 'name',
              type: 'varchar',
              length: '50',
              isUnique: true,
              isNullable: false,
            },
            {
              name: 'title',
              type: 'varchar',
              length: '100',
              isNullable: false,
            },
            {
              name: 'description',
              type: 'text',
              isNullable: true,
            },
            {
              name: 'isDefault',
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
              onUpdate: 'CURRENT_TIMESTAMP',
            },
          ],
        }),
        true,
      );
    }

    // ====== ۲. ایجاد جدول users ======
    const usersTableExists = await queryRunner.hasTable('users');
    if (!usersTableExists) {
      await queryRunner.createTable(
        new Table({
          name: 'users',
          columns: [
            {
              name: 'id',
              type: 'int',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            {
              name: 'firstName',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'lastName',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'phone',
              type: 'varchar',
              length: '20',
              isUnique: true,
              isNullable: true, // ✅ nullable
            },
            {
              name: 'email',
              type: 'varchar',
              length: '255',
              isUnique: true,
              isNullable: true, // ✅ تغییر به nullable
            },
            {
              name: 'password',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'avatar',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'role_id',
              type: 'int',
              isNullable: false,
              default: 1,
            },
            {
              name: 'isEmailVerified',
              type: 'boolean',
              default: false,
            },
            {
              name: 'isPhoneVerified',
              type: 'boolean',
              default: false,
            },
            {
              name: 'emailVerificationToken',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'emailVerificationExpires',
              type: 'timestamp',
              isNullable: true,
            },
            {
              name: 'resetPasswordToken',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'resetPasswordExpires',
              type: 'timestamp',
              isNullable: true,
            },
            {
              name: 'isActive',
              type: 'boolean',
              default: true,
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
              onUpdate: 'CURRENT_TIMESTAMP',
            },
          ],
          foreignKeys: [
            {
              columnNames: ['role_id'],
              referencedTableName: 'roles',
              referencedColumnNames: ['id'],
              onDelete: 'CASCADE',
              onUpdate: 'CASCADE',
            },
          ],
        }),
        true,
      );
    }

    // ====== ۳. ایندکس‌های جدول users ======
    const usersTable = await queryRunner.getTable('users');

    // ایندکس email
    const emailIndex = usersTable?.indices.find((idx) => idx.name === 'IDX_USER_EMAIL');
    if (!emailIndex) {
      await queryRunner.createIndex(
        'users',
        new TableIndex({
          name: 'IDX_USER_EMAIL',
          columnNames: ['email'],
        }),
      );
    }

    // ایندکس phone
    const phoneIndex = usersTable?.indices.find((idx) => idx.name === 'IDX_USER_PHONE');
    if (!phoneIndex) {
      await queryRunner.createIndex(
        'users',
        new TableIndex({
          name: 'IDX_USER_PHONE',
          columnNames: ['phone'],
        }),
      );
    }

    // ====== ۴. ایجاد جدول otp ======
    const otpTableExists = await queryRunner.hasTable('otp');
    if (!otpTableExists) {
      await queryRunner.createTable(
        new Table({
          name: 'otp',
          columns: [
            {
              name: 'id',
              type: 'int',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            {
              name: 'code',
              type: 'varchar',
              length: '6',
              isNullable: false,
            },
            {
              name: 'expiresIn',
              type: 'timestamp',
              isNullable: false,
            },
            {
              name: 'method',
              type: 'varchar',
              length: '50',
              isNullable: true,
            },
            {
              name: 'userId',
              type: 'int',
              isNullable: false,
              isUnique: true,
            },
          ],
          foreignKeys: [
            {
              columnNames: ['userId'],
              referencedTableName: 'users',
              referencedColumnNames: ['id'],
              onDelete: 'CASCADE',
            },
          ],
        }),
        true,
      );
    }

    // ====== ۵. ایندکس جدول otp ======
    const otpTable = await queryRunner.getTable('otp');
    if (otpTable) {
      const otpIndex = otpTable.indices.find((idx) => idx.name === 'IDX_OTP_USER_ID');
      if (!otpIndex) {
        await queryRunner.createIndex(
          'otp',
          new TableIndex({
            name: 'IDX_OTP_USER_ID',
            columnNames: ['userId'],
            isUnique: true,
          }),
        );
      }
    }

    // ====== ۶. درج داده‌های اولیه roles ======
    const rolesCount = await queryRunner.query(`SELECT COUNT(*) as count FROM roles`);
    if (rolesCount[0].count === 0) {
      await queryRunner.query(`
        INSERT INTO roles (name, title, description, isDefault) VALUES
        ('admin', 'مدیر', 'مدیر سیستم با دسترسی کامل', false),
        ('user', 'کاربر', 'کاربر عادی', true),
        ('moderator', 'ناظر', 'ناظر محتوا', false)
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // حذف جدول‌ها با بررسی وجود آنها
    if (await queryRunner.hasTable('otp')) {
      await queryRunner.dropTable('otp', true);
    }
    if (await queryRunner.hasTable('users')) {
      await queryRunner.dropTable('users', true);
    }
    if (await queryRunner.hasTable('roles')) {
      await queryRunner.dropTable('roles', true);
    }
  }
}
