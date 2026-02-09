# hkr-landing

SvelteKit + Vite app backed by Postgres via Prisma.

## Prereqs

- Node.js (recommended: 20+)
- A Postgres database you can connect to (`DATABASE_URL`)

## Fresh setup (local dev)

1. Create `.env` from the example:
   - `cp .env.example .env`
2. Fill in required env vars in `.env`:
   - `DATABASE_URL` (Postgres connection string)
   - `PUBLIC_RECAPTCHA_SITEKEY`
   - `RECAPTCHA_SECRETKEY`
   - For local dev, you can use the Google test keys listed in `.env.example`.
3. Install dependencies:
   - `npm install` (or `npm ci` if you want lockfile-reproducible installs)
4. Apply database migrations:
   - `npx prisma migrate dev`
5. (Optional) Seed initial data:
   - `npx prisma db seed`
6. Start the dev server:
   - `npm run dev`
   - Vite will print the local URL (usually `http://localhost:5173`).

## Notes

- If you use `npx prisma migrate deploy` (typical for production), also run `npx prisma generate` as part of your deploy/build.
- Optional internal DB tunnel:
  - `npm run tunneldb` opens an SSH tunnel to a remote Postgres on local port `5433` (requires SSH access).
  - Point `DATABASE_URL` at `localhost:5433` if you use this.

## Useful commands

- `npx prisma studio` (inspect DB)
- `npm run build` (production build)
- `npm run preview` (preview build)
