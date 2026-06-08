# Vi & Jay Wedding HQ

This repository contains the full **Vi & Jay Wedding HQ** app.

## What is included

- React + Vite frontend
- Tailwind CSS styling
- Express backend API
- SQLite database via `better-sqlite3`
- PWA install and offline support
- AI chat integration with Anthropic
- Push notification subscription support

## Setup instructions

1. Open Terminal in `/Users/kaycarpio/vi-jay-wedding`
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the project root with your Anthropic API key:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

4. Start both frontend and backend:

```bash
npm run dev
```

5. Open the app in your browser:

```text
http://localhost:4173
```

## Backend only

To run just the backend server:

```bash
npm run server
```

## Notes

- App data is stored in `data/app.db`.
- Uploads are stored in the database and served by `/api/photo` and `/api/logo`.
- The app needs a valid `ANTHROPIC_API_KEY` to use the chat feature.
- Push notification support works best in a secure context (HTTPS) and after install.
