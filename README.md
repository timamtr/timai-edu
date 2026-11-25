# TimAI Edu — ҰБТ-ға дайындалудың жаңа деңгейі

Информатика пәнінен 9–11 сынып оқушыларын ҰБТ-ға жүйелі дайындауға арналған EdTech платформа.

## Іске қосу (Local Setup)
1. `npm install`
2. `cp .env.example .env.local` және `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` мәндерін толтырыңыз.
3. Supabase SQL Editor ішінде `supabase/migrations/0001` — `0005` және `supabase/seed.sql` файлдарын орындаңыз.
4. `npm run dev`

## Тестілеу және Build
- `npm test` — Vitest автотесттері
- `npx tsc --noEmit` — TypeScript тексерісі
- `npm run build` — Production жинақтау

## Vercel Deployment
GitHub репозиторийін Vercel-ге қосып, `NEXT_PUBLIC_SUPABASE_URL` және `NEXT_PUBLIC_SUPABASE_ANON_KEY` айнымалыларын енгізіңіз.
