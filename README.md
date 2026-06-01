# Student Portal (Starter)

Scaffold for a global student portal with Next.js, Prisma, and NextAuth.

Quick start:

```bash
npm install
cp .env.example .env
# for local development, .env uses SQLite by default
npx prisma migrate dev --name init
npm run dev
```

Next steps:
- Configure a PostgreSQL database (Neon/Supabase/Postgres)
- Fill `.env.local` values
- Implement real NextAuth adapter and providers
- Add Stripe / upload provider integration
