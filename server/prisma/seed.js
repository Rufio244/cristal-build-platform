const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'demo@cristal.page' },
    update: { name: 'Cristal Creator', plan: 'PRO', aiCredits: 1240, passwordHash: hash('demo123') },
    create: { email: 'demo@cristal.page', name: 'Cristal Creator', passwordHash: hash('demo123'), plan: 'PRO', aiCredits: 1240 },
  });
  const website = await prisma.website.upsert({
    where: { subdomain: 'coffeebloom.cristal.page' },
    update: {},
    create: { userId: user.id, title: 'CoffeeBloom', subdomain: 'coffeebloom.cristal.page', status: 'PUBLISHED', views: 3200, pages: { home: { title: 'CoffeeBloom', content: '<h1>Fresh coffee, made beautiful.</h1>' } } },
  });
  const existing = await prisma.communityPost.findFirst({ where: { websiteId: website.id, userId: user.id } });
  if (!existing) await prisma.communityPost.create({ data: { userId: user.id, websiteId: website.id, caption: 'A warm coffee shop landing page generated with Cristal AI.', tags: ['DesignInspo', 'WebDev'], likesCount: 124, sharesCount: 5 } });
  console.log(`Seeded demo user ${user.email}`);
}
main().catch((error) => { console.error(error); process.exit(1); }).finally(() => prisma.$disconnect());
