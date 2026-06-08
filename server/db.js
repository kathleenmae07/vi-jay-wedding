import fs from 'fs'
import path from 'path'
import Database from 'better-sqlite3'

const dataFolder = path.join(process.cwd(), 'data')
if (!fs.existsSync(dataFolder)) {
  fs.mkdirSync(dataFolder, { recursive: true })
}

const uploadsFolder = path.join(process.cwd(), 'uploads')
const receiptFolder = path.join(uploadsFolder, 'receipts')
const inspoFolder = path.join(uploadsFolder, 'inspo')
const vendorsFolder = path.join(uploadsFolder, 'vendors')
for (const folder of [uploadsFolder, receiptFolder, inspoFolder, vendorsFolder]) {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true })
  }
}

const publicVisionFolder = path.join(process.cwd(), 'public', 'vision')

const staticVisionAssets = [
  {
    filename: 'invitation-front.png',
    key: 'vision-invitation-front',
    category: 'inspo',
    title: 'Wedding Invitation',
    note: '',
    categoryLabel: 'Decor',
    status: 'confirmed',
    link: 'https://canva.link/p4sf0c7glrd38tz',
  },
  {
    filename: 'invitation-envelope.png',
    key: 'vision-invitation-envelope',
    category: 'inspo',
    title: 'Invitation Envelope',
    note: '',
    categoryLabel: 'Decor',
    status: 'confirmed',
    link: '',
  },
  {
    filename: 'menu.png',
    key: 'vision-menu-card',
    category: 'inspo',
    title: 'Wedding Menu Card',
    note: '',
    categoryLabel: 'Food',
    status: 'confirmed',
    link: '',
  },
  {
    filename: 'tablesign1.png',
    key: 'vision-table-sign-1',
    category: 'inspo',
    title: 'Table Sign No. 1',
    note: '',
    categoryLabel: 'Decor',
    status: 'confirmed',
    link: '',
  },
]

const extensionMap = {
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg'
}

const filenameMimeMap = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
}

function getMimeTypeFromFilename(filename) {
  return filenameMimeMap[path.extname(filename).toLowerCase()] || 'application/octet-stream'
}

function loadStaticVisionAsset(filename, key, category = 'inspo') {
  const assetPath = path.join(publicVisionFolder, filename)
  if (!fs.existsSync(assetPath)) return
  const existing = db.prepare('SELECT key FROM uploaded_files WHERE key = ?').get(key)
  const data = fs.readFileSync(assetPath)
  saveUploadedFile(key, data, getMimeTypeFromFilename(filename), category)
  return key
}

function seedStaticVisionAssets() {
  staticVisionAssets.forEach((asset) => {
    loadStaticVisionAsset(asset.filename, asset.key, asset.category)
  })
}

const dbPath = path.join(dataFolder, 'app.db')
const db = new Database(dbPath)

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS app_data (
    id INTEGER PRIMARY KEY DEFAULT 1,
    todos TEXT DEFAULT '[]',
    vendors TEXT DEFAULT '[]',
    budget TEXT DEFAULT '[]',
    brain_dump TEXT DEFAULT '',
    chat_messages TEXT DEFAULT '[]',
    settings TEXT DEFAULT '{}',
    vision TEXT DEFAULT '[]',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS push_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    endpoint TEXT UNIQUE,
    keys TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS uploaded_files (
    key TEXT PRIMARY KEY,
    data BLOB,
    path TEXT,
    mime_type TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`)

const uploadedFileColumns = db.prepare("PRAGMA table_info(uploaded_files)").all().map((column) => column.name)
if (!uploadedFileColumns.includes('path')) {
  db.exec('ALTER TABLE uploaded_files ADD COLUMN path TEXT')
}

export const defaultTodos = [
  { id: 'book-hm-artist', text: 'Book hair & makeup artist', category: 'Beauty', month: 'Jul', status: 'todo', delegate: null, note: '' },
  { id: 'honeymoon-destination', text: 'Finalize honeymoon destination', category: 'Travel', month: 'Jul', status: 'todo', delegate: null, note: '' },
  { id: 'dress-fitting', text: 'Final dress fitting', category: 'Attire', month: 'Aug', status: 'todo', delegate: null, note: '' },
  { id: 'ribbon-vendor', text: 'Confirm ribbon escort display vendor & colors', category: 'Decor', month: 'Aug', status: 'todo', delegate: null, note: '' },
  { id: 'party-attire', text: 'Confirm wedding party attire', category: 'Attire', month: 'Aug', status: 'todo', delegate: null, note: '' },
  { id: 'rehearsal-guest-list', text: 'Rehearsal dinner — guest list', category: 'Rehearsal', month: 'Aug', status: 'todo', delegate: null, note: '' },
  { id: 'headcount-venue', text: 'Final headcount to venue', category: 'Venue', month: 'Sep', status: 'todo', delegate: null, note: '' },
  { id: 'menu-creme', text: 'Finalize menu with Crème de la Crème', category: 'Food', month: 'Sep', status: 'todo', delegate: null, note: '' },
  { id: 'ceremony-music', text: 'Confirm ceremony music / DJ', category: 'Music', month: 'Sep', status: 'todo', delegate: null, note: '' },
  { id: 'write-vows', text: 'Write vows ✍️', category: 'Ceremony', month: 'Sep', status: 'todo', delegate: null, note: '' },
  { id: 'trial-run', text: 'Hair & makeup trial run', category: 'Beauty', month: 'Sep', status: 'todo', delegate: null, note: '' },
  { id: 'final-payments', text: 'Send final payments to vendors', category: 'Misc', month: 'Sep', status: 'todo', delegate: null, note: '' },
  { id: 'seating-chart', text: 'Create seating chart', category: 'Guests', month: 'Sep', status: 'todo', delegate: null, note: '' },
  { id: 'rehearsal-details', text: 'Rehearsal dinner — confirm venue & details Oct 29', category: 'Rehearsal', month: 'Sep', status: 'todo', delegate: null, note: '' },
  { id: 'vendor-arrival-times', text: 'Confirm ALL vendor arrival times', category: 'Venue', month: 'Oct', status: 'todo', delegate: null, note: '' },
  { id: 'ribbon-delivery', text: 'Deliver ribbon escort display materials', category: 'Decor', month: 'Oct', status: 'todo', delegate: null, note: '' },
  { id: 'dress-pickup', text: 'Final dress pickup', category: 'Attire', month: 'Oct', status: 'todo', delegate: null, note: '' },
  { id: 'rehearsal-dinner', text: 'Oct 29 Thursday — Rehearsal dinner! 🎭', category: 'Rehearsal', month: 'Oct', status: 'todo', delegate: null, note: '' },
  { id: 'thank-you-note-plan', text: 'Write thank-you note plan', category: 'Misc', month: 'Oct', status: 'todo', delegate: null, note: '' },
  { id: 'final-invitations', text: 'Send final invitations', category: 'Guests', month: 'Jun', status: 'done', delegate: null, note: '' },
]

const defaultVendors = [
  { id: 'venue', name: 'Crème de la Crème', role: 'Venue', contact: '727 Young St, Youngsville, LA 70592', notes: 'Ceremony 4:30 PM, Reception 6:00 PM', status: 'confirmed' },
  { id: 'photographer', name: 'TBD', role: 'Photographer', contact: '', notes: '', status: 'not booked' },
  { id: 'florist', name: 'TBD', role: 'Florist', contact: '', notes: 'Ribbon colors: orange, teal, fuchsia, blush, rust, olive', status: 'not booked' },
  { id: 'hair-makeup', name: 'TBD', role: 'Hair & Makeup', contact: '', notes: '', status: 'in progress' },
  { id: 'music', name: 'TBD', role: 'DJ / Music', contact: '', notes: '', status: 'not booked' },
]

const defaultBudget = [
  { id: 'venue', category: 'Venue', budget: 8000, spent: 0 },
  { id: 'catering', category: 'Catering', budget: 6000, spent: 0 },
  { id: 'photography', category: 'Photography', budget: 3500, spent: 0 },
  { id: 'florals', category: 'Florals & Decor', budget: 2500, spent: 0 },
  { id: 'attire', category: 'Attire', budget: 2000, spent: 0 },
  { id: 'music', category: 'Music/DJ', budget: 1500, spent: 0 },
  { id: 'hair-makeup', category: 'Hair & Makeup', budget: 800, spent: 0 },
  { id: 'rehearsal', category: 'Rehearsal Dinner', budget: 2000, spent: 0 },
  { id: 'misc', category: 'Misc', budget: 1000, spent: 0 },
]

const defaultSettings = {
  onboardComplete: false,
  firstVisit: true,
  heroPosition: 'center',
  pushEnabled: false,
  photoPosition: 'center',
  logoUploaded: false,
  notificationSchedule: 'morning',
  calendarConfirmed: false,
  priorities: [],
}

const defaultVision = staticVisionAssets.map((asset) => ({
  id: asset.key,
  title: asset.title,
  note: asset.note,
  category: asset.categoryLabel,
  status: asset.status,
  link: asset.link,
  imageKey: asset.key,
  assetKey: null,
  createdAt: new Date().toISOString(),
}))

const currentColumns = db.prepare("PRAGMA table_info(app_data)").all().map((column) => column.name)
if (!currentColumns.includes('vision')) {
  db.exec("ALTER TABLE app_data ADD COLUMN vision TEXT DEFAULT '[]'")
}

const init = db.prepare('SELECT id FROM app_data WHERE id = 1').get()
if (!init) {
  db.prepare(
    'INSERT INTO app_data (id, todos, vendors, budget, brain_dump, chat_messages, settings, vision) VALUES (1, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    JSON.stringify(defaultTodos),
    JSON.stringify(defaultVendors),
    JSON.stringify(defaultBudget),
    '',
    JSON.stringify([]),
    JSON.stringify(defaultSettings),
    JSON.stringify(defaultVision)
  )
}

seedStaticVisionAssets()

function ensureDefaultVisionItems() {
  const row = db.prepare('SELECT vision FROM app_data WHERE id = 1').get()
  if (!row) return
  const currentVision = JSON.parse(row.vision || '[]')
  const missing = defaultVision.filter((item) => !currentVision.some((existing) => existing.id === item.id))
  if (missing.length > 0) {
    const updatedVision = [...currentVision, ...missing]
    db.prepare('UPDATE app_data SET vision = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1').run(
      JSON.stringify(updatedVision)
    )
  }
}

ensureDefaultVisionItems()

export function getAppData() {
  const row = db.prepare('SELECT * FROM app_data WHERE id = 1').get()
  return {
    todos: JSON.parse(row.todos),
    vendors: JSON.parse(row.vendors),
    budget: JSON.parse(row.budget),
    brain_dump: row.brain_dump,
    chat_messages: JSON.parse(row.chat_messages),
    settings: JSON.parse(row.settings),
    vision: JSON.parse(row.vision || '[]'),
  }
}

export function saveAppData(payload) {
  db.prepare(
    'UPDATE app_data SET todos = ?, vendors = ?, budget = ?, brain_dump = ?, chat_messages = ?, settings = ?, vision = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1'
  ).run(
    JSON.stringify(payload.todos || []),
    JSON.stringify(payload.vendors || []),
    JSON.stringify(payload.budget || []),
    payload.brain_dump || '',
    JSON.stringify(payload.chat_messages || []),
    JSON.stringify(payload.settings || {}),
    JSON.stringify(payload.vision || [])
  )
}

const extensionMap = {
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg'
}

export function saveUploadedFile(key, data, mimeType, category = 'misc') {
  const safeCategory = ['receipts', 'inspo', 'vendors'].includes(category) ? category : 'misc'
  const extension = extensionMap[mimeType] || '.jpg'
  const uploadsDir = path.join(uploadsFolder, safeCategory)
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
  }
  const filename = `${key}${extension}`
  const filePath = path.join(uploadsDir, filename)
  fs.writeFileSync(filePath, data)

  const stmt = db.prepare(
    'INSERT INTO uploaded_files (key, data, path, mime_type, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)'
  )
  try {
    stmt.run(key, data, filePath, mimeType)
  } catch (error) {
    db.prepare('UPDATE uploaded_files SET data = ?, path = ?, mime_type = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?').run(data, filePath, mimeType, key)
  }
}

export function getUploadedFile(key) {
  const row = db.prepare('SELECT data, path, mime_type FROM uploaded_files WHERE key = ?').get(key)
  if (!row) return null
  if (row.data) return row
  if (row.path && fs.existsSync(row.path)) {
    return { data: fs.readFileSync(row.path), mime_type: row.mime_type }
  }
  return null
}

export function saveSubscription(endpoint, keys) {
  db.prepare(
    'INSERT INTO push_subscriptions (endpoint, keys) VALUES (?, ?) ON CONFLICT(endpoint) DO UPDATE SET keys = excluded.keys'
  ).run(endpoint, JSON.stringify(keys))
}

export function getSubscriptions() {
  return db.prepare('SELECT endpoint, keys FROM push_subscriptions').all().map((row) => ({ endpoint: row.endpoint, keys: JSON.parse(row.keys) }))
}

export function getDefaultAppData() {
  return {
    todos: defaultTodos,
    vendors: defaultVendors,
    budget: defaultBudget,
    brain_dump: '',
    chat_messages: [],
    settings: defaultSettings,
    vision: defaultVision,
  }
}

export default db
