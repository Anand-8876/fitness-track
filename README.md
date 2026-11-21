# FitTrack

AI-powered calorie, macro and fitness tracker. Snap a photo of your food (Indian meals included) and Claude identifies each item and estimates calories, protein, carbs, fat and fiber. It also tracks water, workouts, weight and optional physique check-ins.

The original single-file version is kept in [`legacy/`](legacy/).

## Features

- **Accounts**: email and password sign-up with a full-screen, multi-step onboarding. Every sign-in is stored as its own session row: you stay signed in for 90 days (extended while active), and you can see and revoke devices from **Profile → Sessions**.
- **Optional physique photos at sign-up** (front/side/back). Claude estimates your body-fat % and gives a short assessment. That estimate switches the calorie math to Katch-McArdle and bases protein on lean mass.
- **Log food 3 ways**:
  - 📸 photo (camera or upload, with an optional note like "cooked in ghee")
  - ✍️ plain-text description ("2 rotis and a bowl of dal")
  - ✏️ manual entry
  AI results are itemised and editable (portion multipliers, per-item macros) before anything is saved.
- **Daily dashboard**: calorie ring, macro bars, meals, water, today's workout and AI meal ideas that fit your remaining macros.
- **Workouts**: weekly split builder (gym / cardio / rest) with the original exercise library, plus a daily completion tick.
- **Progress**: 14/30-day calorie and protein charts against target, weight trend, logging streak and a physique photo timeline with re-analysis.
- **Targets** recalculate when you update your profile or log a new weight. You can also override them manually.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Prisma + SQLite · bcrypt · Claude API (`@anthropic-ai/sdk`, model `claude-opus-5`, structured outputs).

## Setup

```bash
npm install
# 1. Put your Anthropic API key in .env (get one at https://console.anthropic.com)
#    ANTHROPIC_API_KEY="sk-ant-..."
# 2. Create the database
npx prisma migrate dev
# 3. Run
npm run dev
```

Open http://localhost:3000. To use it on your phone, run `npm run dev -- -H 0.0.0.0` and open `http://<your-PC-IP>:3000` on the same Wi-Fi.

Everything except the AI features works without an API key. The AI screens show a clear "AI is not configured" message until you add one.

## Where things live

| Path | What |
|---|---|
| `prisma/schema.prisma` | Data model: users, sessions, profile/targets, food, water, weight, workouts, photos |
| `src/lib/auth.ts` | DB-backed sessions (random token in an httpOnly cookie, SHA-256 hash in the DB) |
| `src/lib/ai.ts` | Claude prompts and schemas for food photo/text analysis, physique analysis and meal ideas |
| `src/lib/nutrition.ts` | BMR/TDEE and macro-target formulas |
| `src/app/api/**` | JSON API routes |
| `src/components/**` | UI (Today, Log food sheet, Workout, Progress, Profile) |
| `uploads/` | Uploaded photos (git-ignored). Served only to their owner via `/api/photos/...` |

## Production notes

- Switch to Postgres by changing `provider` in `prisma/schema.prisma` and setting `DATABASE_URL`.
- Photos are stored on local disk. On serverless hosts (e.g. Vercel), move `src/lib/uploads.ts` to object storage (S3, R2, Supabase Storage).
- Session cookies are marked `Secure` in production, so serve over HTTPS.
