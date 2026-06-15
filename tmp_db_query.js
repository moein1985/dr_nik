const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.user.findMany({
  where: { username: { in: ['staff', 'admin', 'superadmin'] } },
  select: { id: true, username: true, role: true, email: true, isActive: true },
})
  .then((rows) => {
    console.log(JSON.stringify(rows, null, 2));
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
