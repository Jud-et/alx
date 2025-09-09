ALX-AI Agents Polly
====================

Modern polling app built with Next.js App Router and Supabase Auth.

Overview
--------

ALX-AI Agents Polly lets users register/login and create/vote on polls. The app uses Supabase for authentication and data storage, and wraps protected pages with an auth context so only logged-in users can access them.

Tech Stack
----------

- Next.js 15 (App Router)
- React 19
- TypeScript
- Supabase (Auth + Database)
- Tailwind (via shadcn-esque UI primitives in `components/ui`)

Features
--------

- Email/password authentication with Supabase
- Auth context (`useAuth`) providing `session` and `supabase` client
- Protected routes for polls pages
- Create Poll flow with validation and redirect to detail page
- Health check API route at `/api/health`

Getting Started
---------------

Prerequisites
-------------

- Node.js 18+ and npm
- A Supabase project with URL and anon key

Environment Variables
---------------------

Create a `.env.local` file at the repository root with the following keys:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

These are required at runtime; the app will throw a clear error if missing. After changing `.env.local`, restart the dev server.

Install & Run
-------------

```bash
npm install
npm run dev
# Local: http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

Supabase Setup
--------------

Create the `polls` table and enable RLS (replace `gen_random_uuid()` with `uuid_generate_v4()` if your Postgres extension set differs):

```sql
create table if not exists public.polls (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  options jsonb not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.polls enable row level security;

create policy "Allow insert own polls" on public.polls
for insert to authenticated
with check (created_by = auth.uid());

create policy "Allow select polls" on public.polls
for select to authenticated
using (true);
```

If you prefer `text[]` for `options`, change the column type accordingly; the UI sends a string array compatible with either `jsonb` or `text[]`.

Auth Configuration
------------------

- In Supabase Auth Settings, set:
  - Site URL: `http://localhost:3000`
  - Redirect URLs: add `http://localhost:3000/login`
- If email confirmations are ON, users will be prompted to check their email after sign-up.

Key Pages
---------

- `/register` – Create account (email/password) with optional confirmation
- `/login` – Sign in with email/password
- `/polls` – Protected dashboard
- `/polls/new` – Protected create poll form
- `/polls/[id]` – Protected poll detail (mocked content pending DB reads)
- `/api/health` – Simple health check JSON

Project Structure
-----------------

```text
app/
  (auth)/login/page.tsx        # Login page
  (auth)/register/page.tsx     # Registration page
  polls/page.tsx               # Protected list
  polls/new/page.tsx           # Protected create form (writes to Supabase)
  polls/[id]/page.tsx          # Protected detail (mock content)
components/
  protected-route.tsx          # Redirects unauthenticated users to /login
  ui/*                         # Minimal UI primitives
lib/
  auth-context.tsx             # AuthProvider and useAuth hook
  supabase-client.ts           # Browser client using @supabase/ssr
```

Troubleshooting
---------------

- Runtime error: "Missing required environment variable"
  - Ensure `.env.local` contains both keys and that you restarted the dev server.
- Sign-up returns `session: null`
  - Email confirmation is enabled; check your inbox and follow the link back to `/login`.
- Insert into `polls` fails (RLS)
  - Verify you are authenticated and that RLS policies allow `insert` for `created_by = auth.uid()`.
- 401/Forbidden writes
  - Make sure you are logged in and the anon key is correct.

Scripts
-------

- `npm run dev` – Start the Next.js dev server
- `npm run build` – Production build (typecheck + static output)
- `npm start` – Start the production server

License
-------

MIT (or project default). Update as needed.

Product Requirements Document (PRD)
-----------------------------------

A detailed PRD is in `docs/PRD.md`.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
