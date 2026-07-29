import dataSource from '../data-source';
import { seedAdminUser } from './admin-user.seed';
import { seedRolesAndPermissions } from './roles-permissions.seed';

async function run(): Promise<void> {
  const source = await dataSource.initialize();
  try {
    await seedRolesAndPermissions(source);
    console.log('Seed completed: ADMIN/MANAGER/USER roles and base permissions are in place.');

    await seedAdminUser(source);
  } finally {
    await source.destroy();
  }
}

run().catch((error) => {
  console.error('Seed failed:', error);
  process.exitCode = 1;
});
