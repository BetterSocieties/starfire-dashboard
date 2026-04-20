# starfire-dashboard

Dashboard for Starfire companies (Better Societies, Simple Guide to Life, Echo Studio, OpsFuel).

Built on Next.js App Router + Tailwind + Supabase Auth (email magic link).

## Routes

- `/` home
- `/login` email magic link auth
- `/dashboard` authenticated landing, redirects to `/login` if no session
- `/dashboard/bs` Better Societies
- `/dashboard/sgtl` Simple Guide to Life
- `/dashboard/echo-studio` Echo Studio
- `/dashboard/opsfuel` OpsFuel
- `/api/health` 200 JSON health probe

## Env

Copy `.env.example` to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://qcmxbmxamrqzqifhyzbj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Develop

```
npm install
npm run dev
```

## Deploy

Auto-deploys to Vercel on push to main via the Vercel GitHub integration.
