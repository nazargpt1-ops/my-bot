# HabitFlow - Telegram Mini App

A gamified task management application built as a Telegram Mini App with React, Supabase, and Telegram Bot integration.

## Features

- 🎯 Task management with categories and priorities
- 🪙 Coin-based reward system with achievements
- 🔥 Streak tracking and level progression
- 🎨 In-app shop for themes and customization
- 🤖 Telegram bot for voice task creation and notifications
- 📊 Analytics dashboard with progress visualizations

## Project Structure

```
my-bot/
├── frontend/          # React TypeScript frontend (Telegram WebApp)
├── bot/              # Node.js Telegram bot (Telegraf.js)
├── database/         # Supabase database schema and migrations
└── docs/            # Project documentation
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL), Edge Functions
- **Bot**: Node.js, Telegraf.js
- **Deployment**: Vercel (frontend), Supabase (backend), Railway/Render (bot)

## Getting Started

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Bot Setup

```bash
cd bot
npm install
npm run dev
```

### Database Setup

1. Create a new Supabase project
2. Run the database schema from `database/schema.sql`
3. Set up environment variables

## Environment Variables

### Frontend (.env)
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Bot (.env)
```
TELEGRAM_BOT_TOKEN=your_bot_token
HABITFLOW_API_URL=https://your-frontend.vercel.app
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

## Development

- Frontend runs on `http://localhost:5173`
- Bot development with `npm run dev`
- Database migrations in `database/` directory

## Deployment

- **Frontend**: Vercel (auto-deploy on push to main)
- **Database**: Supabase
- **Bot**: Railway or Render
- **CI/CD**: GitHub Actions

## License

MIT License