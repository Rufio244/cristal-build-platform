const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'cristal-build-server' });
});

app.post('/api/ai/generate', async (req, res) => {
  const { userId, prompt, title } = req.body;

  if (!userId || !prompt) {
    return res.status(400).json({ error: 'userId และ prompt จำเป็นต้องระบุ' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้งาน' });
    }

    if (user.aiCredits <= 0) {
      return res.status(400).json({ error: 'AI Credits หมดแล้ว กรุณาอัปเกรดแพ็กเกจ' });
    }

    const websiteTitle = title?.trim() || 'My AI Website';
    const slug = websiteTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'website';
    const subdomain = `${slug}-${Math.floor(Math.random() * 100000)}`;
    const generatedPages = {
      home: {
        title: websiteTitle,
        content: `<h1>ยินดีต้อนรับสู่ ${websiteTitle}</h1><p>สร้างอัตโนมัติด้วยไอเดีย: ${prompt}</p>`,
      },
      about: {
        title: 'เกี่ยวกับเรา',
        content: '<h1>เกี่ยวกับเรา</h1><p>หน้านี้สร้างขึ้นอัตโนมัติโดย Cristal AI Engine</p>',
      },
      contact: {
        title: 'ติดต่อเรา',
        content: '<h1>ติดต่อเรา</h1><p>อีเมล: contact@cristal.page</p>',
      },
    };

    const [updatedUser, website] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { aiCredits: { decrement: 1 } },
      }),
      prisma.website.create({
        data: {
          userId,
          title: websiteTitle,
          subdomain,
          status: 'DRAFT',
          pages: generatedPages,
        },
      }),
    ]);

    res.status(201).json({ success: true, aiCredits: updatedUser.aiCredits, website });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/community/post', async (req, res) => {
  const { userId, websiteId, caption, tags = [] } = req.body;

  if (!userId || !websiteId || !caption) {
    return res.status(400).json({ error: 'userId, websiteId และ caption จำเป็นต้องระบุ' });
  }

  try {
    const post = await prisma.communityPost.create({
      data: { userId, websiteId, caption, tags },
      include: { user: true, website: true },
    });
    res.status(201).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/community/posts', async (_req, res) => {
  try {
    const posts = await prisma.communityPost.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: true, website: true, comments: true },
    });
    res.json({ posts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/websites/remix', async (req, res) => {
  const { sourceWebsiteId, newUserId } = req.body;

  if (!sourceWebsiteId || !newUserId) {
    return res.status(400).json({ error: 'sourceWebsiteId และ newUserId จำเป็นต้องระบุ' });
  }

  try {
    const sourceWebsite = await prisma.website.findUnique({ where: { id: sourceWebsiteId } });
    if (!sourceWebsite) {
      return res.status(404).json({ error: 'ไม่พบเว็บไซต์ต้นฉบับ' });
    }

    const remixedWebsite = await prisma.website.create({
      data: {
        userId: newUserId,
        title: `Remix of ${sourceWebsite.title}`,
        subdomain: `remix-${Math.floor(Math.random() * 1000000)}`,
        status: 'DRAFT',
        pages: sourceWebsite.pages,
      },
    });

    res.status(201).json({ success: true, remixedWebsite });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Cristal Build Server running on port ${PORT}`);
});

const shutdown = async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
