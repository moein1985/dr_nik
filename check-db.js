const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPosts() {
  const posts = await prisma.freshPost.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
  console.log('Posts:', JSON.stringify(posts, null, 2));
  await prisma.$disconnect();
}

checkPosts().catch(console.error);
