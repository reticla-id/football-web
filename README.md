# Football Analytics Web App

This workspace now contains a premium football analytics frontend built with Next.js, TypeScript, Tailwind, and a Supabase-ready data layer. The existing Python ETL backend in the backend folder remains intact and was not modified.

## Frontend

- Next.js App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- TanStack Table-ready structure
- Zustand store
- Supabase auth and query layer
- Responsive premium dashboard UI

## Run locally

1. In the frontend folder, copy .env.local.example to .env.local
2. Fill in your Supabase credentials:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
3. Install dependencies:
   - npm install
4. Start the dev server:
   - npm run dev

## Notes

- The UI uses local mock data when Supabase env vars are not configured.
- The Supabase query layer is prepared for tables such as users, teams, players, fixtures, standings, and player_statistics.
- The Python ETL pipeline in backend remains unchanged.
