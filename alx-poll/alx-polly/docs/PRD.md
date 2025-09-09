# ALX-AI Agents Polly – Product Requirements Document (PRD)

## 1. Summary
ALX-AI Agents Polly is a lightweight polling application where users can create, view, and vote on polls. Authentication is handled via Supabase. The app uses Next.js App Router with protected routes and an auth context for a seamless client-side experience.

## 2. Goals
- Allow users to sign up, sign in, and maintain a session.
- Allow authenticated users to create polls with at least two options.
- Allow authenticated users to view polls and cast votes.
- Provide a simple, responsive UI with minimal friction.

## 3. Non-Goals (MVP)
- Advanced moderation, analytics, or admin dashboards.
- Public unauthenticated poll participation.
- Real-time updates beyond standard page actions.

## 4. Users & Personas
- Guest: Can access auth pages but cannot see/create polls.
- Registered User: Can create polls and (future) vote.

## 5. User Stories
1. As a guest, I can register with email/password so I can create polls.
2. As a user, I can sign in so I can access my polls.
3. As a user, I can create a poll with at least two options.
4. As a user, I see validation errors if my inputs are invalid.
5. As a user, I’m redirected to the poll detail page after creation.

## 6. Functional Requirements
- Authentication
  - Email/password registration and login using Supabase.
  - Optional email confirmation with return redirect to `/login`.
- Polls
  - Create poll: `question` (text), `options` (jsonb or text[]), `created_by` (uuid).
  - List and detail pages are protected and require authentication.
  - Future: record votes, prevent duplicate votes, show results.

## 7. Data Model (MVP)
Table: `public.polls`
- `id` uuid primary key (default `gen_random_uuid()`)
- `question` text not null
- `options` jsonb not null (array of strings) – or `text[]`
- `created_by` uuid not null references `auth.users(id)`
- `created_at` timestamptz not null default `now()`

RLS Policies:
- Insert: authenticated users where `created_by = auth.uid()`
- Select: authenticated users

## 8. UX Flow
1. Register (or Login) → if confirmation enabled, user checks email and returns to `/login`.
2. `/polls` dashboard (protected)
3. `/polls/new` create form (protected) → on success redirect to `/polls/[id]`.

## 9. Edge Cases & Validation
- Passwords must be at least 8 characters (client-side guard).
- Create poll requires at least two unique, non-empty options.
- Server failures (RLS, network, wrong schema) show inline error messages.

## 10. Performance & Reliability
- Client-side Supabase calls in protected pages.
- Minimal bundle size; UI primitives only.

## 11. Out of Scope (for now)
- Organization/multi-tenant support
- Sharing/embedding polls
- Real-time results, pagination, search

## 12. Milestones
- M1: Auth + protected routes
- M2: Create poll (write path)
- M3: Poll detail and voting (read/write paths)

## 13. Success Metrics
- Time to first poll created by a new user
- Error rate on create flow
- Conversion: register → create poll


