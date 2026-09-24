const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'cristal-local-development-secret';
const PORT = Number(process.env.PORT || 5000);

app.use(cors({ origin: process.env.CLIENT_URL || true }));
app.use(express.json({ limit: '2mb' }));

const hash = (value) => crypto.createHash('sha256').update(String(value)).digest('hex');
const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'website';
const base64url = (value) => Buffer.from(value).toString('base64url');

function signToken(user) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({ sub: user.id, email: user.email, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 }));
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${signature}`;
}

function verifyToken(token) {
  try {
    const [header, payload, signature] = String(token || '').split('.');
    if (!header || !payload || !signature) return null;
    const expected = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${payload}`).digest('base64url');
    if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return decoded.exp > Math.floor(Date.now() / 1000) ? decoded : null;
  } catch (_error) {
    return null;
  }
}

function auth(req, res, next) {
  const decoded = verifyToken(req.headers.authorization?.replace(/^Bearer\s+/i, ''));
  if (!decoded) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบใหม่' });
  req.userId = decoded.sub;
  next();
}

const publicUser = ({ passwordHash, ...user }) => user;

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'cristal-build-server' }));

app.post('/api/auth/register', async (req, res) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password || password.length < 6) return res.status(400).json({ error: 'กรอกข้อมูลให้ครบและใช้รหัสผ่านอย่างน้อย 6 ตัวอักษร' });
  try {
    const user = await prisma.user.create({ data: { email: email.toLowerCase().trim(), name: name.trim(), passwordHash: hash(password) } });
    res.status(201).json({ user: publicUser(user), token: signToken(user) });
  } catch (error) {
    res.status(error.code === 'P2002' ? 409 : 500).json({ error: error.code === 'P2002' ? 'อีเมลนี้ถูกใช้งานแล้ว' : error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.body.email?.toLowerCase().trim() } });
    if (!user || user.passwordHash !== hash(req.body.password || '')) return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    res.json({ user: publicUser(user), token: signToken(user) });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/auth/me', auth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) return res.status(404).json({ error: 'ไม่พบผู้ใช้งาน' });
  res.json({ user: publicUser(user) });
});

app.get('/api/users/me/websites', auth, async (req, res) => {
  res.json({ websites: await prisma.website.findMany({ where: { userId: req.userId }, orderBy: { updatedAt: 'desc' } }) });
});

app.post('/api/ai/generate', auth, async (req, res) => {
  const { prompt, title } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt จำเป็นต้องระบุ' });
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: 'ไม่พบผู้ใช้งาน' });
    const websiteTitle = title?.trim() || 'My AI Website';
    let pages;
    if (process.env.OPENAI_API_KEY) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', response_format: { type: 'json_object' }, messages: [{ role: 'system', content: 'Return JSON with home, about, contact keys. Each value has title and safe HTML content.' }, { role: 'user', content: `Create a website titled ${websiteTitle}. Idea: ${prompt}` }] }) });
      if (!response.ok) throw new Error('AI provider request failed');
      pages = JSON.parse((await response.json()).choices[0].message.content);
    } else {
      pages = { home: { title: websiteTitle, content: `<h1>ยินดีต้อนรับสู่ ${websiteTitle}</h1><p>${prompt}</p>` }, about: { title: 'เกี่ยวกับเรา', content: '<h1>เกี่ยวกับเรา</h1>' }, contact: { title: 'ติดต่อเรา', content: '<h1>ติดต่อเรา</h1>' } };
    }
    const result = await prisma.$transaction(async (tx) => {
      const charged = await tx.user.updateMany({ where: { id: req.userId, aiCredits: { gt: 0 } }, data: { aiCredits: { decrement: 1 } } });
      if (charged.count !== 1) throw Object.assign(new Error('AI Credits หมดแล้ว กรุณาอัปเกรดแพ็กเกจ'), { status: 400 });
      const website = await tx.website.create({ data: { userId: req.userId, title: websiteTitle, subdomain: `${slugify(websiteTitle)}-${Date.now()}`, status: 'DRAFT', pages } });
      const remaining = await tx.user.findUnique({ where: { id: req.userId }, select: { aiCredits: true } });
      return { website, aiCredits: remaining.aiCredits };
    });
    res.status(201).json({ success: true, ...result, provider: process.env.OPENAI_API_KEY ? 'openai' : 'mock' });
  } catch (error) { res.status(error.status || 500).json({ error: error.message }); }
});

app.patch('/api/websites/:id', auth, async (req, res) => {
  const data = {};
  if (typeof req.body.title === 'string' && req.body.title.trim()) data.title = req.body.title.trim();
  if (req.body.pages && typeof req.body.pages === 'object') data.pages = req.body.pages;
  if (req.body.status === 'DRAFT' || req.body.status === 'PUBLISHED') data.status = req.body.status;
  const result = await prisma.website.updateMany({ where: { id: req.params.id, userId: req.userId }, data });
  if (!result.count) return res.status(404).json({ error: 'ไม่พบเว็บไซต์' });
  res.json({ success: true });
});

app.post('/api/websites/:id/publish', auth, async (req, res) => {
  const result = await prisma.website.updateMany({ where: { id: req.params.id, userId: req.userId }, data: { status: 'PUBLISHED' } });
  if (!result.count) return res.status(404).json({ error: 'ไม่พบเว็บไซต์' });
  res.json({ success: true, status: 'PUBLISHED' });
});

app.get('/api/public/sites/:subdomain', async (req, res) => {
  try {
    const website = await prisma.website.findUnique({ where: { subdomain: req.params.subdomain } });
    if (!website || website.status !== 'PUBLISHED') return res.status(404).json({ error: 'ไม่พบเว็บไซต์ที่เผยแพร่แล้ว' });
    await prisma.website.update({ where: { id: website.id }, data: { views: { increment: 1 } } });
    res.json({ website });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/community/posts', async (_req, res) => {
  res.json({ posts: await prisma.communityPost.findMany({ orderBy: { createdAt: 'desc' }, include: { user: true, website: true, comments: true } }) });
});

app.post('/api/community/post', auth, async (req, res) => {
  const { websiteId, caption, tags = [] } = req.body;
  if (!websiteId || !caption) return res.status(400).json({ error: 'websiteId และ caption จำเป็นต้องระบุ' });
  res.status(201).json({ post: await prisma.communityPost.create({ data: { userId: req.userId, websiteId, caption, tags }, include: { user: true, website: true } }) });
});

app.post('/api/websites/remix', auth, async (req, res) => {
  const source = await prisma.website.findUnique({ where: { id: req.body.sourceWebsiteId } });
  if (!source) return res.status(404).json({ error: 'ไม่พบเว็บไซต์ต้นฉบับ' });
  const website = await prisma.website.create({ data: { userId: req.userId, title: `Remix of ${source.title}`, subdomain: `remix-${Date.now()}`, status: 'DRAFT', pages: source.pages } });
  res.status(201).json({ website });
});

app.post('/api/billing/checkout', auth, async (req, res) => {
  const plan = req.body.plan === 'PRO' ? 'PRO' : 'STARTER';
  const credits = plan === 'PRO' ? 500 : 50;
  const user = await prisma.user.update({ where: { id: req.userId }, data: { plan, aiCredits: { increment: credits } } });
  res.json({ success: true, mode: 'local-demo', plan: user.plan, aiCredits: user.aiCredits });
});

const server = app.listen(PORT, () => console.log(`Cristal Build Server running on port ${PORT}`));
const shutdown = async () => { await prisma.$disconnect(); server.close(() => process.exit(0)); };
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
