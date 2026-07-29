import { DataSource } from 'typeorm';
import { hashSecret } from '../../common/utils/hash.util';
import { Role } from '../../modules/roles/entities/role.entity';
import { User } from '../../modules/users/entities/user.entity';
import { UserRole } from '../../modules/permissions/entities/user-role.entity';

/**
 * Bootstraps the very first ADMIN user from ADMIN_EMAIL/ADMIN_PASSWORD env
 * vars. Without this there is no way to obtain the first token: every
 * write endpoint is RBAC-protected, including user creation itself.
 * No-op (with a log line) when the env vars are not set or the user already exists.
 */
export async function seedAdminUser(dataSource: DataSource): Promise<void> {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log('Skipping admin user bootstrap: set ADMIN_EMAIL and ADMIN_PASSWORD to enable it.');
    return;
  }

  const userRepository = dataSource.getRepository(User);
  const roleRepository = dataSource.getRepository(Role);
  const userRoleRepository = dataSource.getRepository(UserRole);

  const existing = await userRepository.findOne({ where: { email } });
  if (existing) {
    console.log(`Admin user ${email} already exists, skipping.`);
    return;
  }

  const adminRole = await roleRepository.findOne({ where: { name: 'ADMIN' } });
  if (!adminRole) {
    throw new Error('ADMIN role not found — run the roles/permissions seed first.');
  }

  const passwordHash = await hashSecret(password);
  const user = await userRepository.save(
    userRepository.create({ email, name: 'Administrator', passwordHash }),
  );
  await userRoleRepository.save(
    userRoleRepository.create({ userId: user.id, roleId: adminRole.id }),
  );

  console.log(`Admin user ${email} created and assigned the ADMIN role.`);
}
