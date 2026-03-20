# Yunity Studio

A focused fitness and nutrition tracking app built with Next.js 15 and Supabase. Yunity helps users follow personalised AI workout plans, log their training, track nutrition, and watch real progress — all in one place.

---

## Features

### AI Workout Plans — History-Aware Personalisation
- Generates a full weekly workout split tailored to the user's goal (lose / maintain / gain)
- Before generating, the AI reads the user's **PR history**, **recent session volume**, **previous plan structure**, and **body weight** — so every new plan builds on what came before, not a generic template
- Progressive overload, stalled lift detection, and volume calibration are baked in automatically

### Workout Logging
- Log each set with weight, reps, and a completion tick
- **Cardio exercises** (jogging, cycling, swimming, HIIT, etc.) switch to a duration + distance UI automatically — no sets/weight fields
- **Live PR detection** — flags a new personal best mid-session the moment it happens
- **Est. 1RM** calculated per set using the Epley formula
- **Smart rest timer** — auto-starts after each completed set, with duration adapted per exercise type (longer for compound lifts)
- **Exercise video demos** — YouTube embed for every exercise with fuzzy name matching; always shows a YouTube search fallback
- Add any extra exercise mid-session from a library of 100+ movements
- **Calorie burn estimate** calculated per session using the MET formula (exercise-type MET × body weight × duration), stored and synced to the nutrition dashboard

### Flexible Day Picker & Plan Customisation
- Users choose which plan day to follow today — not locked to weekday names
- Selection persists via a cookie and updates the fitness dashboard's "today" card
- Per-day AI customisation: describe a change in plain text and the AI rewrites that day in place
- Remove days or add new training days (with a focus description) at any time
- Days are labelled Day 1, Day 2… with a focus name — no Monday/Tuesday dependency

### Nutrition Dashboard
- **Daily meal log** — add, edit, and delete meals throughout the day
- **AI nutrition estimator** — type what you ate in plain text ("2 scrambled eggs and toast") and AI returns estimated calories, protein, carbs, and fats; all fields are editable before logging
- **AI meal ideas** — pick a meal slot, add optional preferences, and get 3 AI-suggested meals calibrated to your remaining daily targets
- **Calorie progress bar** — visual indicator that turns amber near the limit and red when over
- **Macro tracking** — consumed vs. daily targets for protein, carbs, and fats shown as pills
- **Calorie burn sync** — workout calories burned appear on the nutrition dashboard with a net calorie calculation (eaten − burned)

### Progress & History
- Per-exercise PR records with date, weight, reps, and estimated 1RM
- Session history with exercise logs, volume totals, and calorie burn per session
- Weight trend chart from logged body weight entries

### Account & Goals
- Edit personal measurements: weight, height, activity level, goal
- Saving measurements auto-recalculates TDEE and updates the daily calorie target (Mifflin-St Jeor formula)
- **Nutrition goals override** — manually set calorie target, protein, carbs, and fats targets independently of the auto-calculated values

### Landing Page
- Full "How It Works" showcase: personalisation spotlight, workout/nutrition ecosystem diagram, feature grid
- Pricing section with 7-day free trial

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Database & Auth | Supabase (PostgreSQL + Row Level Security) |
| AI | OpenAI GPT-4o-mini |
| Payments | Stripe |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Icons | Lucide React |
| Internationalisation | next-intl |

---

## Database Setup

Run the following in your Supabase SQL editor before using calorie burn and nutrition features:

```sql
-- Calorie burn per workout session
ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS calories_burned integer;

-- Daily meal log
CREATE TABLE IF NOT EXISTS meal_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  meals jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own meal logs"
  ON meal_logs FOR ALL USING (auth.uid() = user_id);

-- Custom macro targets on profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS protein_target integer;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS carbs_target integer;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fats_target integer;
```

---

## Local Development

```bash
npm install
npm run dev
```

Copy `.env.local.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment

Deployed on Vercel. Push to `production-fix` branch to trigger a new build.
