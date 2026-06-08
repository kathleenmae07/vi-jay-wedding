import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4174;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve public folder
app.use('/public', express.static(path.join(__dirname, '../public')));

// Setup upload directories
const uploadDirs = ['uploads', 'uploads/receipts', 'uploads/inspo', 'uploads/vendors', 'uploads/vision', 'uploads/hero', 'uploads/logo'];
uploadDirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

// Multer config for generic uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = req.params.category || 'inspo';
    const dir = path.join(__dirname, 'uploads', category);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Multer config for hero photo (overwrites single file)
const heroStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads/hero')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, 'hero' + ext);
  }
});
const uploadHero = multer({ storage: heroStorage });

// Multer config for logo (overwrites single file)
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads/logo')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    cb(null, 'logo' + ext);
  }
});
const uploadLogo = multer({ storage: logoStorage });

// Multer config for generic files (receipts, etc.)
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = req.body.category || 'receipts';
    const dir = path.join(__dirname, 'uploads', category);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const key = req.body.key || (Date.now() + '-' + file.originalname);
    cb(null, key + path.extname(file.originalname));
  }
});
const uploadFile = multer({ storage: fileStorage });

// Data file path
const DATA_FILE = path.join(__dirname, 'wedding-data.json');

function getDefaultAppData() {
  return {
    todos: [
      { id: 1, text: 'Book hair & makeup artist', category: 'Beauty', status: 'doing', month: 'Jul', delegated: null },
      { id: 2, text: 'Finalize honeymoon destination & dates', category: 'Travel', status: 'todo', month: 'Jul', delegated: null },
      { id: 3, text: 'Final dress fitting', category: 'Attire', status: 'todo', month: 'Aug', delegated: null },
      { id: 4, text: 'Confirm ribbon escort display vendor & colors', category: 'Decor', status: 'todo', month: 'Aug', delegated: null },
      { id: 5, text: 'Confirm wedding party attire', category: 'Attire', status: 'todo', month: 'Aug', delegated: null },
      { id: 6, text: 'Rehearsal dinner — guest list', category: 'Rehearsal', status: 'todo', month: 'Aug', delegated: null },
      { id: 7, text: 'Final headcount to venue', category: 'Venue', status: 'todo', month: 'Sep', delegated: null },
      { id: 8, text: 'Finalize menu with Crème de la Crème', category: 'Food', status: 'todo', month: 'Sep', delegated: null },
      { id: 9, text: 'Confirm ceremony music / DJ', category: 'Music', status: 'todo', month: 'Sep', delegated: null },
      { id: 10, text: 'Write vows ✍️', category: 'Ceremony', status: 'todo', month: 'Sep', delegated: null },
      { id: 11, text: 'Hair & makeup trial run', category: 'Beauty', status: 'todo', month: 'Sep', delegated: null },
      { id: 12, text: 'Send final payments to vendors', category: 'Misc', status: 'todo', month: 'Sep', delegated: null },
      { id: 13, text: 'Create seating chart', category: 'Guests', status: 'todo', month: 'Sep', delegated: null },
      { id: 14, text: 'Rehearsal dinner — confirm venue & details Oct 29', category: 'Rehearsal', status: 'todo', month: 'Sep', delegated: null },
      { id: 15, text: 'Confirm ALL vendor arrival times', category: 'Venue', status: 'todo', month: 'Oct', delegated: null },
      { id: 16, text: 'Deliver ribbon escort display materials', category: 'Decor', status: 'todo', month: 'Oct', delegated: null },
      { id: 17, text: 'Final dress pickup', category: 'Attire', status: 'todo', month: 'Oct', delegated: null },
      { id: 18, text: '🎭 Oct 29 Thursday — Rehearsal dinner!', category: 'Rehearsal', status: 'todo', month: 'Oct', delegated: null },
      { id: 19, text: 'Send final invitations', category: 'Guests', status: 'done', month: 'Jun', delegated: null },
    ],
    vendors: [
      { id: 1, name: 'Crème de la Crème', role: 'Venue', status: 'confirmed', contact: '', notes: '727 Young St, Youngsville LA 70592', photos: [] },
      { id: 2, name: 'TBD', role: 'Photographer', status: 'todo', contact: '', notes: '', photos: [] },
      { id: 3, name: 'TBD', role: 'Florist', status: 'todo', contact: '', notes: 'Ribbon: orange, teal, fuchsia, blush, rust, olive', photos: [] },
      { id: 4, name: 'TBD', role: 'Hair & Makeup', status: 'doing', contact: '', notes: '', photos: [] },
      { id: 5, name: 'TBD', role: 'DJ / Music', status: 'todo', contact: '', notes: '', photos: [] },
    ],
    budget: [
      { id: 1, category: 'Venue', budget: 8000, spent: 0, receipts: [] },
      { id: 2, category: 'Catering', budget: 6000, spent: 0, receipts: [] },
      { id: 3, category: 'Photography', budget: 3500, spent: 0, receipts: [] },
      { id: 4, category: 'Florals & Decor', budget: 2500, spent: 0, receipts: [] },
      { id: 5, category: 'Attire', budget: 2000, spent: 0, receipts: [] },
      { id: 6, category: 'Music / DJ', budget: 1500, spent: 0, receipts: [] },
      { id: 7, category: 'Hair & Makeup', budget: 800, spent: 0, receipts: [] },
      { id: 8, category: 'Rehearsal Dinner', budget: 2000, spent: 0, receipts: [] },
      { id: 9, category: 'Misc', budget: 1000, spent: 0, receipts: [] },
    ],
    brainDump: '',
    chatMessages: [],
    vision: [
      {
        id: 'vision-preload-1',
        title: 'Wedding Invitation',
        category: 'Decor',
        status: 'confirmed',
        publicImage: '/public/Vision/invitation-front.png',
        imageKey: null,
        assetKey: null,
        link: 'https://canva.link/p4sf0c7glrd38tz',
        note: 'Front of invitation',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'vision-preload-2',
        title: 'Invitation Envelope',
        category: 'Decor',
        status: 'confirmed',
        publicImage: '/public/Vision/invitation-envelope.png',
        imageKey: null,
        assetKey: null,
        link: '',
        note: '',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'vision-preload-3',
        title: 'Wedding Menu Card',
        category: 'Food',
        status: 'confirmed',
        publicImage: '/public/Vision/menu.png',
        imageKey: null,
        assetKey: null,
        link: '',
        note: '',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'vision-preload-4',
        title: 'Table Sign No. 1',
        category: 'Decor',
        status: 'confirmed',
        publicImage: '/public/Vision/tablesign1.png',
        imageKey: null,
        assetKey: null,
        link: '',
        note: '',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ],
    settings: {
      onboarded: false,
      onboardComplete: false,
      photoPosition: 'center 22%',
    }
  };
}

function loadAppData() {
  const defaults = getDefaultAppData();
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      const data = JSON.parse(raw);

      // Migrate visionBoard → vision flat array if needed
      if (!data.vision && data.visionBoard) {
        const confirmed = (data.visionBoard.confirmed || []).map((item, i) => ({
          id: `vision-migrated-${i}`,
          title: item.title || '',
          category: item.category || 'Decor',
          status: 'confirmed',
          publicImage: item.image || null,
          imageKey: null,
          assetKey: null,
          link: item.link || '',
          note: item.notes || '',
          createdAt: '2026-01-01T00:00:00.000Z',
        }));
        const dream = (data.visionBoard.dream || []).map((item, i) => ({
          id: `vision-dream-${i}`,
          ...item,
          status: 'dream',
        }));
        data.vision = [...dream, ...confirmed];
        delete data.visionBoard;
      }

      // Seed pre-loaded confirmed items if they're missing
      if (!data.vision) data.vision = [];
      const existingIds = new Set(data.vision.map((v) => v.id));
      for (const item of defaults.vision) {
        if (!existingIds.has(item.id)) {
          data.vision.push(item);
        }
      }

      return data;
    }
  } catch (e) {
    console.log('Error loading data, using defaults');
  }
  return defaults;
}

function saveAppData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error saving data:', e);
  }
}

// ── ROUTES ──────────────────────────────────────────

// Get all app data
app.get('/api/data', (req, res) => {
  const data = loadAppData();
  res.json(data);
});

// Save all app data
app.post('/api/data', (req, res) => {
  const data = req.body;
  saveAppData(data);
  res.json({ ok: true });
});

// AI Chat
app.post('/api/chat', async (req, res) => {
  const { messages, brainDump } = req.body;
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: `You are a warm, enthusiastic wedding planning bestie helping Vi (a cardiovascular nurse practitioner) plan her wedding to Jay on October 31, 2026. Rehearsal dinner is October 29, 2026 (Thursday). Venue: Crème de la Crème, 727 Young St, Youngsville, LA 70592. Ceremony 4:30 PM, Reception 6:00 PM. Vi has ADHD — always give encouragement and bite-sized actionable advice. Wedding aesthetic: vibrant, colorful — burgundy, rust orange, blush pink, olive green. J&V monogram logo with disco ball. Ribbon escort display colors: orange, teal, fuchsia, blush, rust, olive. Vietnamese-American bilingual theme. Groom's parents: Ông Nguyễn Như Steven & Bà Dương Mỹ Nhung. Bride's parents: Ông Mai Văn An & Bà Vũ Thị Vân. Dog: Charley (pitbull mix). Vi lives between San Francisco (works as cardiovascular NP) and Colorado (home base — best planning time is Colorado trips). Keep responses warm, fun, concise, mobile-friendly. Brain dump notes: ${brainDump || 'None yet'}`,
      messages: messages.map(m => ({ role: m.from === 'user' ? 'user' : 'assistant', content: m.text }))
    });
    res.json({ reply: response.content[0].text });
  } catch (e) {
    console.error('Chat error:', e);
    res.status(500).json({ error: 'Chat unavailable' });
  }
});

// Upload photo
app.post('/api/upload/:category', upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  const url = `/uploads/${req.params.category}/${req.file.filename}`;
  res.json({ url });
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── HERO PHOTO ──────────────────────────────────────────

// GET /api/photo — serve uploaded hero photo or fallback to public/hero-photo.JPEG
app.get('/api/photo', (req, res) => {
  const heroDir = path.join(__dirname, 'uploads/hero');
  let files = [];
  try { files = fs.readdirSync(heroDir).filter(f => /\.(jpe?g|png|webp|gif)$/i.test(f)); } catch {}
  if (files.length > 0) {
    return res.sendFile(path.join(heroDir, files[0]));
  }
  // Fallback to public folder — handle both .jpg and .JPEG
  const jpegPath = path.join(__dirname, '../public/hero-photo.JPEG');
  const jpgPath = path.join(__dirname, '../public/hero-photo.jpg');
  if (fs.existsSync(jpegPath)) return res.sendFile(jpegPath);
  if (fs.existsSync(jpgPath)) return res.sendFile(jpgPath);
  res.status(404).json({ error: 'No hero photo found' });
});

// POST /api/photo — upload new hero photo
app.post('/api/photo', uploadHero.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ ok: true, filename: req.file.filename });
});

// ── J&V LOGO ──────────────────────────────────────────

// GET /api/logo — serve uploaded logo or fallback to public/jv-logo.png
app.get('/api/logo', (req, res) => {
  const logoDir = path.join(__dirname, 'uploads/logo');
  let files = [];
  try { files = fs.readdirSync(logoDir).filter(f => /\.(jpe?g|png|webp|gif|svg)$/i.test(f)); } catch {}
  if (files.length > 0) {
    return res.sendFile(path.join(logoDir, files[0]));
  }
  // Fallback to public folder
  const logoPath = path.join(__dirname, '../public/jv-logo.png');
  if (fs.existsSync(logoPath)) return res.sendFile(logoPath);
  res.status(404).json({ error: 'No logo found' });
});

// POST /api/logo — upload new logo
app.post('/api/logo', uploadLogo.single('logo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ ok: true, filename: req.file.filename });
});

// ── FILE (receipts, etc.) ──────────────────────────────

// POST /api/file — upload a file with a key
app.post('/api/file', uploadFile.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ ok: true, key: req.body.key });
});

// GET /api/file/:key — serve a file by key
app.get('/api/file/:key', (req, res) => {
  const key = decodeURIComponent(req.params.key);
  // Search all upload subdirectories for a file starting with the key
  const dirs = ['receipts', 'inspo', 'vendors', 'vision'];
  for (const dir of dirs) {
    const dirPath = path.join(__dirname, 'uploads', dir);
    try {
      const files = fs.readdirSync(dirPath).filter(f => f.startsWith(key));
      if (files.length > 0) return res.sendFile(path.join(dirPath, files[0]));
    } catch {}
  }
  res.status(404).json({ error: 'File not found' });
});

// Reset data
app.post('/api/reset', (req, res) => {
  const defaultData = getDefaultAppData();
  saveAppData(defaultData);
  res.json({ ok: true });
});

// Serve frontend in production
const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

app.listen(port, () => {
  console.log(`Wedding HQ server running on http://localhost:${port}`);
});