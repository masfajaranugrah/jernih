// db/seeds/seed-admin.ts
// Script bikin akun ADMIN — jalanin: npm run db:seed:admin
import * as bcrypt from 'bcrypt';
import { db, genId, closePool, schema } from './lib';

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@jernihcreative.id';
  const password = process.env.ADMIN_PASSWORD || 'Admin123!';

  const hashed = await bcrypt.hash(password, 12);

  const [admin] = await db
    .insert(schema.users)
    .values({
      id: genId('usr'),
      email,
      password: hashed,
      name: 'Admin Jernih',
      role: 'ADMIN',
      isActive: true,
    })
    .onConflictDoUpdate({
      target: schema.users.email,
      set: { password: hashed, isActive: true },
    })
    .returning({
      id: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      role: schema.users.role,
    });

  console.log('✅ Admin account ready:');
  console.log(`   Email: ${admin.email}`);
  console.log(`   Name:  ${admin.name}`);
  console.log(`   Role:  ${admin.role}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(closePool);