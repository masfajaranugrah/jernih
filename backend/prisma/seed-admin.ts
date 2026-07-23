// Script bikin akun ADMIN — jalanin: npx ts-node prisma/seed-admin.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@jernihcreative.id';
  const password = process.env.ADMIN_PASSWORD || 'Admin123!';

  const hashed = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      password: hashed,
      name: 'Admin Jernih',
      role: 'ADMIN',
      isActive: true,
    },
    update: {
      password: hashed,
      isActive: true,
    },
    select: { id: true, email: true, name: true, role: true },
  });

  console.log('✅ Admin account ready:');
  console.log(`   Email: ${admin.email}`);
  console.log(`   Name:  ${admin.name}`);
  console.log(`   Role:  ${admin.role}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
