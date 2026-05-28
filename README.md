# FSS Tracker — Functional Strength Systems

Client tracking, session logging, program builder and progress reports.

## Stack
- **Frontend:** Vanilla HTML/CSS/JS (no build step needed)
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel
- **Domain:** functionalstrengthsystems.co (GoDaddy)

## Files
- `index.html` — app shell and HTML structure
- `style.css` — FSS-branded styles
- `app.js` — all logic + Supabase integration
- `vercel.json` — Vercel deployment config

## Supabase Setup (already done)
Project: fxxnychsxqbpaqgtvesg
URL: https://fxxnychsxqbpaqgtvesg.supabase.co

Run this SQL in Supabase SQL Editor if tables don't exist:
```sql
create table clients (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  freq int default 2,
  pkg int default 10,
  price int default 0,
  sessions int default 0,
  goal text,
  status text default 'active',
  notes text,
  color int default 0,
  program jsonb default '{}',
  log jsonb default '[]',
  created_at timestamp default now()
);
alter table clients enable row level security;
create policy "Allow all" on clients for all using (true);
```

## Deployment
Deployed via Vercel connected to this GitHub repo.
Auto-deploys on every push to main branch.
