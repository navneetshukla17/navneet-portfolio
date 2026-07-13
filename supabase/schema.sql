-- =========================================================
-- Navneet's Portfolio — Supabase schema
-- Run this once in your Supabase project's SQL Editor:
-- Project > SQL Editor > New query > paste this whole file > Run
-- =========================================================

-- ---------- Tables ----------

create table if not exists profile (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Navneet Shukla',
  tagline text,
  resume_url text,
  photo_url text,
  banner_url text,
  updated_at timestamptz not null default now()
);

create table if not exists links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  url text not null,
  badge text,
  show_in_header boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists experience (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  company text not null,
  start_date text not null,
  end_date text, -- null = "Present"
  bullets text[] not null default '{}',
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists education (
  id uuid primary key default gen_random_uuid(),
  degree text not null,
  institution text not null,
  details text, -- e.g. "Graduated 2026 · CGPA 8.0"
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists certifications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  issuer text,
  date text,
  url text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  pdf_url text,
  live_url text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- Seed the single profile row ----------
-- (the app always reads/writes the first row in this table)
insert into profile (name, tagline)
select 'Navneet Shukla', 'AI Product Intern at CashFlo. Building internal tools, AI agents, and automation systems for Sales and Operations teams.'
where not exists (select 1 from profile);

-- ---------- Seed starting links ----------
-- Update the URLs below to your real profile URLs any time from the admin panel.
insert into links (label, url, badge, show_in_header, display_order)
select 'LinkedIn', 'https://linkedin.com/in/navneet', 'Profile', true, 1
where not exists (select 1 from links where label = 'LinkedIn');

insert into links (label, url, badge, show_in_header, display_order)
select 'GitHub', 'https://github.com/navneet', 'Profile', true, 2
where not exists (select 1 from links where label = 'GitHub');

-- ---------- Seed starting experience ----------
insert into experience (role, company, start_date, end_date, bullets, display_order)
select 'AI Product Intern', 'CashFlo', 'Jan 2026', null, array[
  'Led end-to-end product discovery and delivery of Origin, a unified internal platform consolidating fragmented tools used daily by Sales, Operations, and Admin teams.',
  'Replaced Retool Enterprise license entirely by migrating all internal sales tooling into Origin Platform.',
  'Architected an AI agent (LangChain, LangGraph) that ingests policy documents, auto-extracts and classifies rules, and classifies invoices as Approve / Hold / Reject.',
  'Built an in-house Gemini Flash call-summary system processing 55 calls/day, replacing a paid third-party tool.'
], 1
where not exists (select 1 from experience where company = 'CashFlo');

insert into experience (role, company, start_date, end_date, bullets, display_order)
select 'Web Developer Intern', 'Invictus Outsourcing Solutions Pvt. Ltd.', 'Nov 2023', 'Apr 2024', array[
  'Diagnosed and resolved recurring platform bugs across the company website, reducing user-reported issues.',
  'Redesigned and implemented UI changes on the consumer-facing website in line with brand guidelines.',
  'Built an automated web scraping pipeline in Python (BeautifulSoup, Requests) to extract business-relevant data, eliminating manual data collection.'
], 2
where not exists (select 1 from experience where company = 'Invictus Outsourcing Solutions Pvt. Ltd.');

-- ---------- Seed starting education ----------
insert into education (degree, institution, details, display_order)
select 'Master''s of Computer Applications in Data Science', 'Thakur Institute of Management Studies, Career Development and Research', 'Graduated 2026 · CGPA 8.0', 1
where not exists (select 1 from education where institution like 'Thakur Institute%');

insert into education (degree, institution, details, display_order)
select 'Bachelor''s of Computer Applications in Cyber Security', 'Tilak Maharashtra Vidyapeeth University, Pune', 'Graduated 2024 · CGPA 7.8', 2
where not exists (select 1 from education where institution like 'Tilak Maharashtra%');

-- ---------- Seed starting projects ----------
insert into projects (title, description, live_url, display_order)
select 'Noted — AI-Powered Customer Feedback & Resolution',
  'Owned the full PRD for a three-email communication loop addressing acknowledgement, timeline, and closure gaps in the feedback lifecycle. Powered by Qwen-2 7B.',
  null, 1
where not exists (select 1 from projects where title like 'Noted%');

insert into projects (title, description, live_url, display_order)
select 'TokenToTask — Developer Productivity Dashboard',
  'Defined an efficiency metrics framework (efficiency score, cost-per-deliverable, bug rate) for manager visibility into AI ROI. Shipped a dual-mode CLI + web app across three PRD iterations.',
  null, 2
where not exists (select 1 from projects where title like 'TokenToTask%');

-- Note: pdf_url is left blank for both — upload each project's PRD/deck PDF
-- from the admin panel and it will fill in automatically.

-- ---------- Row Level Security ----------
-- Public (anon) visitors can only READ.
-- Only a logged-in user (you, the single admin) can write.

alter table profile enable row level security;
alter table links enable row level security;
alter table experience enable row level security;
alter table education enable row level security;
alter table certifications enable row level security;
alter table projects enable row level security;

-- Public read policies
create policy "Public can read profile" on profile for select using (true);
create policy "Public can read links" on links for select using (true);
create policy "Public can read experience" on experience for select using (true);
create policy "Public can read education" on education for select using (true);
create policy "Public can read certifications" on certifications for select using (true);
create policy "Public can read projects" on projects for select using (true);

-- Authenticated (admin) write policies — insert/update/delete
create policy "Admin can modify profile" on profile for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Admin can modify links" on links for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Admin can modify experience" on experience for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Admin can modify education" on education for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Admin can modify certifications" on certifications for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Admin can modify projects" on projects for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---------- Storage ----------
-- Two public buckets: one for profile/banner images, one for project PDFs + resume.

insert into storage.buckets (id, name, public)
values ('portfolio-images', 'portfolio-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('portfolio-files', 'portfolio-files', true)
on conflict (id) do nothing;

-- Anyone can view files (needed so visitors' browsers can load the images/PDFs)
create policy "Public can view portfolio images"
  on storage.objects for select
  using (bucket_id = 'portfolio-images');

create policy "Public can view portfolio files"
  on storage.objects for select
  using (bucket_id = 'portfolio-files');

-- Only a logged-in user can upload/replace/delete
create policy "Admin can upload portfolio images"
  on storage.objects for insert
  with check (bucket_id = 'portfolio-images' and auth.role() = 'authenticated');
create policy "Admin can update portfolio images"
  on storage.objects for update
  using (bucket_id = 'portfolio-images' and auth.role() = 'authenticated');
create policy "Admin can delete portfolio images"
  on storage.objects for delete
  using (bucket_id = 'portfolio-images' and auth.role() = 'authenticated');

create policy "Admin can upload portfolio files"
  on storage.objects for insert
  with check (bucket_id = 'portfolio-files' and auth.role() = 'authenticated');
create policy "Admin can update portfolio files"
  on storage.objects for update
  using (bucket_id = 'portfolio-files' and auth.role() = 'authenticated');
create policy "Admin can delete portfolio files"
  on storage.objects for delete
  using (bucket_id = 'portfolio-files' and auth.role() = 'authenticated');

-- =========================================================
-- After running this file:
-- 1. Go to Authentication > Users > Add User, create yourself
--    a login (email + password). That's the only account that
--    will ever exist — it's your admin login.
-- 2. Go to Table Editor > experience / education / projects / links
--    and you can either paste in your starting data there, or
--    just add it through the site's /admin panel after deploying.
-- =========================================================
