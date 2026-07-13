# Navneet Shukla — Portfolio

A dynamic product-management portfolio. Everything on the public page — profile
photo, banner, resume, links, experience, education, certifications, and
projects (with PDF decks) — is editable from a password-protected `/admin`
panel, with no code changes required.

**Stack:** Next.js 14 (App Router) + Supabase (Postgres database, Auth, Storage) + Vercel.

---

## 1. Create your Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**. Pick any name/region, set a database password (save it somewhere), and wait ~2 minutes for it to spin up.
2. In the left sidebar, go to **SQL Editor → New query**.
3. Open `supabase/schema.sql` from this project, paste its entire contents in, and click **Run**.
   This creates all the tables, security rules, storage buckets, and seeds your starting content (experience, education, projects) from your resume.
4. Go to **Authentication → Users → Add user**. Create yourself a login with your email and a password — this is the only account that will ever exist, and it's what you'll use to sign in to `/admin`.
5. Go to **Settings → API**. You'll need three values from this page in the next step:
   - **Project URL**
   - **anon public** key
   - **service_role** key (keep this one secret — never put it in the browser)

## 2. Configure the app locally

```bash
npm install
cp .env.local.example .env.local
```

Open `.env.local` and paste in the three values from Supabase step 5.

```bash
npm run dev
```

Visit `http://localhost:3000` for the public site, and `http://localhost:3000/admin` to log in and manage content. Your resume's starting experience/education/projects are already seeded — sign in and:
- Upload your profile photo and banner (Profile & Banner page)
- Upload your resume PDF (same page)
- Fix the LinkedIn/GitHub URLs to your real profiles (Links page)
- Upload each project's PRD/deck PDF (Projects page)

## 3. Deploy to Vercel

1. Push this project to a GitHub repo.
2. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import that repo.
3. In the import screen, add the same three environment variables from `.env.local`.
4. Click **Deploy**. You'll get a live URL in about a minute.
5. (Optional) Add a custom domain under **Project → Settings → Domains**.

Every edit you make in `/admin` after this updates the live site immediately — no redeploy needed, since content comes from Supabase, not the code.

---

## How content works

| Section | Table | Notes |
|---|---|---|
| Name, tagline, resume, photo, banner | `profile` | Single row. Photo/banner support crop before upload. |
| Header quick-links + full link list | `links` | Each link has a "show in header" toggle. |
| Projects | `projects` | Each project can have a PDF (PRD/deck) with inline preview + download, and an optional live URL. |
| Work Experience | `experience` | Bullets are entered one per line. |
| Education | `education` | Free-text "details" field for graduation year/CGPA. |
| Certifications | `certifications` | Optional issuer, date, and link. |

All tables are readable by anyone (so the public page works) but only writable
by your logged-in admin account (Row Level Security, set up by `schema.sql`).

## Project structure

```
app/
  page.tsx                 → public homepage (fetches everything from Supabase)
  project/[id]/page.tsx     → project detail page with inline PDF viewer
  admin/
    login/page.tsx          → admin sign-in
    (dashboard)/            → all protected admin pages (nav + auth guard)
      profile/               → name, tagline, photo, banner, resume
      links/                 → LinkedIn, GitHub, etc.
      projects/               → projects + PDF upload
      experience/            → work history
      education/
      certifications/
components/                → public-site components
components/admin/           → admin forms, including the crop-uploader
lib/supabase/                → Supabase client setup (browser/server/middleware)
lib/types.ts                 → shared TypeScript types
supabase/schema.sql           → run once in Supabase's SQL Editor
```

## Design system

Colors, fonts (Lexend Exa / Lexend Deca), spacing, and card/button styles all
live in `app/globals.css` as CSS variables, matching the style guide you
provided. Change values in the `:root` block to adjust the whole site's look
in one place.

## Notes

- Only one admin account should ever exist — there's no public sign-up.
- If you ever forget your password, reset it from Supabase's Authentication tab.
- Image uploads are auto-cropped and compressed client-side before upload, so
  file sizes stay small without you needing to resize anything yourself.
