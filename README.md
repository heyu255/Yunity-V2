# YUNITY STUDIO – AI Performance Architect

**Yunity Studio** is a premium, full-stack AI-driven Fitness and Nutrition SaaS designed for serious progress tracking. It leverages large language models to generate personalised workout plans from your actual training history, log your nutrition intelligently, and keep your workout and diet data in sync — so every decision you make is informed by what you've actually done.

**https://yunity-v2.vercel.app/**

<img width="1743" height="814" alt="屏幕截图 2025-12-26 001905" src="https://github.com/user-attachments/assets/8ba75443-88b0-4537-9f92-f593d4e8d4d4" />
<img width="1231" height="899" alt="屏幕截图 2025-12-26 001917" src="https://github.com/user-attachments/assets/52e8495a-c717-4efe-b21c-01091fed982f" />

---

## 🚀 Key Features

### 🧠 History-Aware AI Workout Plans
The AI reads your **PR records, recent session volume, and previous plan structure** before generating your next workout — not a generic template. Progressive overload, stalled lift adjustments, and volume calibration are applied automatically based on what you've actually logged.

### 🏋️ Workout Logging
- Log sets with weight and reps; **live PR detection** flags a new personal best the moment it happens
- **Cardio exercises** (jogging, cycling, HIIT, etc.) switch automatically to a duration + distance UI — no weight/reps fields
- **Estimated 1RM** calculated per set using the Epley formula
- **Smart rest timer** auto-starts after each set, with duration adapted to the exercise type (longer for compounds, shorter for isolation)
- **Exercise video demos** — embedded YouTube tutorial for every exercise with fuzzy name matching; always shows a YouTube search fallback
- **Calorie burn estimate** per session using MET formula (exercise-type MET × body weight × duration), synced automatically to the nutrition dashboard

### 📅 Flexible Day Picker & Plan Customisation
- Choose any plan day to follow today — not tied to weekday names
- Fully customise individual days: describe a change and the AI rewrites that day in place
- Remove days or add new training days (with a focus description) at any time
- Days labelled Day 1, Day 2… with a focus name for clarity

### 🥗 Nutrition Dashboard
- **Daily meal log** — add, edit, and delete meals throughout the day; totals update in real time
- **AI nutrition estimator** — type what you ate in plain text and AI returns estimated calories, protein, carbs, and fats; all fields are editable before logging
- **AI meal ideas** — pick a meal slot, add preferences, and get 3 AI-suggested meals calibrated to your remaining daily targets
- **Calorie progress bar** — turns amber near the limit, red when over
- **Macro tracking** — consumed vs. daily targets (protein, carbs, fats) shown as pill badges
- **Calorie burn sync** — calories burned in the gym appear on the nutrition dashboard with a net calorie calculation (eaten − burned)

### 📊 Progress Tracking
- Per-exercise PR history with weight, reps, 1RM estimate, and date
- Session history with full exercise logs, volume totals, and calorie burn per session
- Weight trend chart from logged body weight entries

### ⚙️ Account & Nutrition Goals
- Edit weight, height, activity level, and goal — TDEE auto-recalculates on save (Mifflin-St Jeor)
- **Custom nutrition targets** — manually override calorie target, protein, carbs, and fat goals independently of the auto-calculated values

### 💳 Subscription & Trial
- 7-day free trial on signup; full feature access unlocked
- Stripe Checkout, Webhooks, and self-service Billing Portal
- Secure onboarding flow with multi-step data collection

---

## 🛠️ Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, Server Actions) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database & Auth | Supabase (PostgreSQL + RLS) |
| AI Engine | OpenAI API (GPT-4o-mini) |
| Payments | Stripe (Subscriptions & Webhooks) |

---

## 🏗️ Technical Architecture

### Data Flow & State Management
Uses **Next.js Server Actions** for all data mutations — no client-side fetching libraries needed. Type safety is enforced from the database query to the view layer.

### Session & Security
Middleware handles Supabase session refreshing and cookie synchronisation. **PostgreSQL Row Level Security (RLS)** ensures users can only access their own data at the database level.

### AI Pipeline
**Structured prompting** with `response_format: json_object` enforces schema-compliant responses from OpenAI. Complex nested data (Days → Exercises → Sets/Reps) is parsed directly into UI state without rendering errors. Workout personalisation prompts include the user's last 30 session logs and PR summary before generation.

---

## 🗄️ Required Database Migrations

Run these in your Supabase SQL editor before using the calorie burn and nutrition features:

\`\`\`sql
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
\`\`\`

---

## 🏁 Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Stripe account
- OpenAI API key

### Installation

1. **Clone the repository**
\`\`\`bash
git clone https://github.com/heyu255/Yunity-V2.git
cd Yunity-V2/yunity-studio
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Configure environment variables** — create \`.env.local\`:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key
OPENAI_API_KEY=your_key
STRIPE_SECRET_KEY=your_key
STRIPE_WEBHOOK_SECRET=your_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
\`\`\`

4. **Run the development server**
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000).

---

## 🔒 Security & Optimisation

- **Webhooks** secured using Stripe signature verification to prevent replay attacks
- **\`force-dynamic\`** rendering on all dashboard routes ensures real-time data accuracy
- **100% TypeScript** coverage for API responses and database schemas
- **RLS policies** enforce data isolation at the database level — no user can query another's data

---

## 📄 License

This project is proprietary. All rights reserved by **Yunity Studio LLC**.
