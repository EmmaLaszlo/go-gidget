# Go Gidget 🐕

A pet-friendly place finder. Search for nearby spots that welcome dogs, see each
place's rating with a short AI-written summary, leave your own reviews, and save
favorites for later.

## Features
- Search pet-friendly places by location and category (Yelp Fusion API)
- AI-generated place summaries written by Claude
- Accounts with registration, login, and logout
- Reviews, favorites, and search history per user
- Place results cached in Postgres to cut down on API calls
- Free tier with a search limit and an upgrade prompt (Stripe payments planned)

## Tech
- Next.js (App Router) + TypeScript
- PostgreSQL with Prisma ORM
- JWT authentication with bcrypt password hashing
- Yelp Fusion API for place data
- Anthropic Claude API for place summaries
- Framer Motion and Lucide icons for the UI

## Run locally
Requires Node.js and a running PostgreSQL database.

1. `cp .env.example .env` and fill in your database URL and API keys
2. `npm install`
3. `npx prisma db push` to create the database tables
4. `npx prisma generate`
5. `npm run dev`, then open http://localhost:3000
