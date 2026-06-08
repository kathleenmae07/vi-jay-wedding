# Vi & Jay Wedding HQ 💍

A beautiful, mobile-first Progressive Web App (PWA) for wedding planning, built with love for Vi & Jay's big day on October 31, 2026.

## Features ✨

- 📱 **Mobile-First PWA** — Install on home screen, works offline
- 🏠 **Home Dashboard** — Live countdown, progress tracking, delegated tasks
- ✅ **Task Management** — Organized by month with status tracking (Todo/Doing/Done)
- 📞 **Phone a Friend** — Delegate tasks to family and friends
- 🧠 **AI-Powered Chat** — Wedding bestie powered by Claude AI
- 💰 **Budget Tracking** — Track spending by category
- 📋 **Vendor Management** — Keep all vendor details in one place
- 🎨 **Custom Branding** — Upload your own hero photo and logo
- 🔔 **Push Notifications** — Reminders and milestone celebrations
- 🌙 **Offline Support** — All data syncs when you're back online

## Tech Stack 🛠️

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS + Custom CSS
- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **AI**: Anthropic Claude API
- **PWA**: vite-plugin-pwa + Service Workers
- **Notifications**: web-push

## Getting Started 🚀

### Prerequisites
- Node.js 24+
- npm 11+

### Local Development

1. **Clone and install**
```bash
cd vi-jay-wedding
npm install
```

2. **Set up environment**
```bash
cp .env.example .env
# Add your Anthropic API key:
# ANTHROPIC_API_KEY=sk-ant-...
```

3. **Generate VAPID keys for push notifications** (optional)
```bash
npx web-push generate-vapid-keys
# Copy the keys into server/index.js
```

4. **Run development server**
```bash
npm run dev
```
- Frontend: http://localhost:5173
- Backend API: http://localhost:4174

The app will open with the splash screen → onboarding flow → main dashboard.

5. **Build for production**
```bash
npm run build
```
This creates optimized builds in `/dist` folder with:
- Minified React app
- Service worker for offline support
- PWA manifest for installability

## Project Structure 📁

```
vi-jay-wedding/
├── src/
│   ├── components/          # React screen components
│   │   ├── SplashScreen.jsx
│   │   ├── OnboardingFlow.jsx
│   │   ├── HomeScreen.jsx
│   │   ├── TasksScreen.jsx
│   │   ├── BrainDumpScreen.jsx
│   │   ├── VendorsScreen.jsx
│   │   ├── DelegateScreen.jsx
│   │   ├── MoreScreen.jsx
│   │   └── TabBar.jsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useAppData.js    # Fetch/sync app data
│   │   └── useCountdown.js  # Countdown timer
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # React entry point
│   └── index.css            # Tailwind + base styles
├── server/
│   ├── index.js             # Express server + routes
│   ├── db.js                # SQLite database setup
│   └── data/                # SQLite database file
├── public/
│   ├── manifest.json        # PWA manifest
│   ├── icon-192.svg         # PWA icon
│   └── icon-512.svg         # PWA icon
├── package.json
├── vite.config.js           # Vite + PWA plugin config
├── tailwind.config.js       # Tailwind CSS config
└── README.md                # This file
```

## API Endpoints 🔌

### Data Sync
- `GET /api/data` — Fetch all app data
- `POST /api/data` — Save all app data

### Chat
- `POST /api/chat` — Send message to AI bestie

### Files
- `POST /api/photo` — Upload hero photo
- `GET /api/photo` — Retrieve hero photo
- `POST /api/logo` — Upload J&V logo
- `GET /api/logo` — Retrieve J&V logo

### Push Notifications
- `POST /api/subscribe` — Register device for notifications
- `POST /api/notify` — Trigger test notification
- `POST /api/reset` — Clear all app data (careful!)

## Deployment 🌐

### Deploy to Railway (Recommended)

1. **Connect your GitHub repo** to Railway
2. **Add environment variables** in Railway dashboard:
   - `ANTHROPIC_API_KEY` = your Claude API key
   - `VAPID_PUBLIC_KEY` = from npx web-push
   - `VAPID_PRIVATE_KEY` = from npx web-push
   - `VAPID_EMAIL` = your email

3. **Railway auto-deploys** on git push

### Deploy to Vercel / Netlify (Frontend only)
```bash
# Build frontend
npm run build

# Deploy dist/ folder to Vercel/Netlify
# Make sure backend API is separately hosted
```

### Deploy to Fly.io
```bash
# Install flyctl
# Authenticate: flyctl auth login
# Deploy:
flyctl deploy
```

## PWA Installation 📲

### iOS (Safari)
1. Open app in Safari
2. Tap Share → Add to Home Screen
3. Tap Add

### Android (Chrome)
1. Open app in Chrome
2. Tap ⋮ (menu) → Install app
3. Tap Install

## Customization 🎨

### Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  burgundy: '#5C1A2E',
  rust: '#B85A1A',
  blush: '#E8A89C',
  olive: '#6B7A3A',
  // ...
}
```

### Fonts
Already set up in index.html:
- **Display**: Pinyon Script (fancy)
- **Serif**: Playfair Display (elegant)
- **Body**: DM Sans (clean)

### Logo & Photo
Use the ⚙️ More tab in the app to:
- Upload your hero photo
- Adjust photo position
- Upload custom J&V logo

## Database 💾

SQLite database with 3 tables:
- `app_data` — Main JSON store for todos, vendors, budget, settings
- `push_subscriptions` — Device push notification endpoints
- `uploaded_files` — Stored photos and logos as BLOBs

To inspect:
```bash
sqlite3 data/app.db
> SELECT * FROM app_data;
```

## Key Architectural Decisions 🏗️

1. **Single-file data model** — All user data in one JSON row for simplicity
2. **Auto-save with debouncing** — 500ms debounce prevents API spam
3. **Service Worker** — Offline-first, syncs when back online
4. **Server-side AI** — API keys never exposed to client
5. **Mobile-first CSS** — Max-width 430px centered on desktop

## Troubleshooting 🔧

### "Can't connect to Anthropic API"
- Check `ANTHROPIC_API_KEY` in server
- Verify key is valid at https://console.anthropic.com

### Photo not uploading
- Check max file size (5MB limit in server)
- Browser might block large files

### Service worker not caching
- Ensure browser is online first time visiting
- Hard refresh (Cmd+Shift+R) to clear cache

### Database locked error
- SQLite WAL mode should prevent this
- Try restarting server if it persists

## Contributing 🤝

This is Vi's special app! Please coordinate changes with the team.

## License 💕

Built with ♥️ for Vi & Jay's wedding.

---

**Ready to get planning?** 💍✨

Run `npm run dev` to get started!
