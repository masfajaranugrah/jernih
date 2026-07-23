"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new client_1.PrismaClient();
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
//# sourceMappingURL=seed-admin.js.map