import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  ArrowRight, CheckCircle2, Dumbbell, ShieldCheck,
  Zap, TrendingUp, Utensils, Play, Trophy, BarChart2,
  CalendarDays, Brain, Timer, Flame, Sparkles, Link2, SlidersHorizontal
} from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const params = await searchParams

  if (params?.code) {
    redirect(`/reset-password?code=${params.code}`)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* ── Nav ─────────────────────────────────────────── */}
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-slate-200 bg-white p-2">
            <Dumbbell className="text-slate-800" size={18} />
          </div>
          <span className="text-lg font-semibold tracking-tight">Yunity Studio</span>
        </div>
        <div className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
          <Link href="#how-it-works" className="transition-colors hover:text-slate-900">How It Works</Link>
          <Link href="#features" className="transition-colors hover:text-slate-900">Features</Link>
          <Link href="#pricing" className="transition-colors hover:text-slate-900">Pricing</Link>
          <Link href="/login" className="transition-colors hover:text-slate-900">Log in</Link>
          <Button asChild className="rounded-full bg-slate-900 px-6 text-white hover:bg-slate-800">
            <Link href="/login">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="relative overflow-hidden pb-24 pt-16">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[420px] w-[780px] -translate-x-1/2 rounded-full bg-gradient-to-b from-white to-slate-100 blur-2xl" />
        </div>
        <div className="mx-auto max-w-7xl px-6 text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-600">
            Focused fitness. Minimal noise.
          </div>

          <h1 className="mb-6 text-5xl font-semibold tracking-tight text-slate-900 md:text-7xl">
            A clean way to plan
            <br />
            training and nutrition.
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl">
            Yunity Studio helps you set goals, follow a weekly plan, and track real progress without clutter.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="h-14 rounded-full bg-slate-900 px-8 text-lg text-white shadow-lg transition-all hover:bg-slate-800">
              <Link href="/login">
                Start Free <ArrowRight className="ml-2" size={20} />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 rounded-full border-slate-300 px-8 text-lg text-slate-700 hover:bg-white">
              <Link href="#how-it-works">See How It Works</Link>
            </Button>
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
            <span className="rounded-full border border-slate-200 bg-white px-4 py-1.5">7-day free trial</span>
            <span className="rounded-full border border-slate-200 bg-white px-4 py-1.5">Weekly AI plans</span>
            <span className="rounded-full border border-slate-200 bg-white px-4 py-1.5">Progress tracking</span>
            <span className="rounded-full border border-slate-200 bg-white px-4 py-1.5">Secure billing</span>
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────── */}
      <section id="how-it-works" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-3 text-3xl font-semibold tracking-tight md:text-5xl">How it works</h2>
            <p className="text-slate-500 text-sm">Everything you need. Nothing you don't.</p>
          </div>

          {/* ── 1. Nutrition ── */}
          <div className="mb-20">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500">
                <Utensils size={15} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Nutrition</h3>
            </div>

            {/* Visual: nutrition dashboard mock */}
            <div className="rounded-2xl bg-slate-900 p-6 mb-6 max-w-sm">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Today's Nutrition</p>
              <div className="space-y-1.5 mb-4">
                <div className="flex justify-between text-xs">
                  <span className="text-white font-bold">1,420 <span className="font-normal text-slate-400">kcal eaten</span></span>
                  <span className="text-slate-400">580 left · 2,000 target</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-full w-[71%] rounded-full bg-emerald-400" />
                </div>
              </div>
              <div className="flex gap-2 mb-4">
                <span className="text-[11px] font-semibold rounded-full px-2 py-0.5 bg-blue-500/20 text-blue-300">Protein 98g <span className="opacity-60">/ 150g</span></span>
                <span className="text-[11px] font-semibold rounded-full px-2 py-0.5 bg-amber-500/20 text-amber-300">Carbs 160g <span className="opacity-60">/ 225g</span></span>
                <span className="text-[11px] font-semibold rounded-full px-2 py-0.5 bg-rose-500/20 text-rose-300">Fats 38g <span className="opacity-60">/ 56g</span></span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-orange-300 font-semibold">
                <Flame size={11} /> 420 kcal burned · <span className="text-slate-300">Net: 1,000 kcal</span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: <Utensils size={14} className="text-orange-500" />, title: 'Daily meal log', desc: 'Add, edit, or delete meals. Calories and macros update live.' },
                { icon: <Brain size={14} className="text-violet-500" />, title: 'AI nutrition estimator', desc: 'Type what you ate — AI fills in the calories and macros.' },
                { icon: <Sparkles size={14} className="text-emerald-500" />, title: 'Meal idea generator', desc: '3 AI meal suggestions calibrated to your remaining targets.' },
                { icon: <CheckCircle2 size={14} className="text-blue-500" />, title: 'Custom macro targets', desc: 'Set your own protein, carbs, and fat goals — or auto-derive.' },
              ].map(f => (
                <div key={f.title} className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white">{f.icon}</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{f.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── 2. Fitness ── */}
          <div className="mb-20">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500">
                <Dumbbell size={15} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Fitness</h3>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-600">Premium</span>
            </div>

            {/* Personalization spotlight */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-950 p-6 mb-6 flex flex-col sm:flex-row gap-6 items-start">
              <div className="flex-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-3">
                  <Sparkles size={9} /> AI Personalization
                </span>
                <p className="text-white font-bold mb-1">Every plan is built from your history</p>
                <p className="text-slate-400 text-xs leading-relaxed">Before generating your next split, the AI reads your PRs, recent volume, and past plan — not a generic template.</p>
              </div>
              <div className="flex-1 w-full space-y-1.5">
                {[
                  '🏋️ Bench PR: 90 kg × 5 — last week',
                  '📈 Squat volume up 15% this month',
                  '🔁 Previous: PPL split, 6 days',
                ].map(l => (
                  <div key={l} className="text-[11px] text-slate-400 bg-white/5 border border-white/10 rounded-lg px-3 py-2 font-mono">{l}</div>
                ))}
                <div className="flex items-center gap-2 pt-1">
                  <div className="h-px flex-1 bg-emerald-500/30" />
                  <ArrowRight size={12} className="text-emerald-400" />
                  <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Your next plan</span>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: <SlidersHorizontal size={14} className="text-emerald-500" />, title: 'Pick your day, customise it', desc: 'Choose any plan day to train. Edit, remove, or add days with AI.' },
                { icon: <Play size={14} className="text-blue-500" />, title: 'Exercise video demos', desc: 'Built-in tutorial for every exercise. YouTube fallback always available.' },
                { icon: <Timer size={14} className="text-indigo-500" />, title: 'Smart rest timer', desc: 'Auto-starts after each set. Longer for compounds, shorter for isolation.' },
                { icon: <Trophy size={14} className="text-amber-500" />, title: 'Live PR detection', desc: 'Flags a new personal best the moment it happens mid-session.' },
                { icon: <CalendarDays size={14} className="text-slate-500" />, title: "Today's plan at a glance", desc: "Dashboard shows last session weights + progressive overload suggestion." },
                { icon: <Flame size={14} className="text-orange-500" />, title: 'Calorie burn per session', desc: 'MET-based estimate synced live to your nutrition dashboard.' },
              ].map(f => (
                <div key={f.title} className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white">{f.icon}</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{f.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── 3. Progress ── */}
          <div className="mb-20">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500">
                <BarChart2 size={15} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Progress</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: <Trophy size={14} className="text-amber-500" />, title: 'PR history', desc: 'Every personal record per exercise — the AI uses these when building your next plan.' },
                { icon: <TrendingUp size={14} className="text-emerald-500" />, title: 'Volume trends', desc: 'Weekly training volume vs. last week — the clearest signal of real progress.' },
                { icon: <BarChart2 size={14} className="text-violet-500" />, title: 'Predicted 1RM', desc: 'Estimated 1-rep max per exercise, tracked over time from your logged sets.' },
                { icon: <Flame size={14} className="text-orange-500" />, title: 'Calorie burn history', desc: 'Total calories burned per session, logged alongside your exercise data.' },
              ].map(f => (
                <div key={f.title} className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white">{f.icon}</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{f.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── 4. Ecosystem ── */}
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 sm:p-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 mb-3">
                <Link2 size={11} /> The full picture
              </div>
              <h3 className="text-xl font-bold text-slate-900">Workout + Nutrition, in sync</h3>
              <p className="text-slate-500 text-sm mt-1">Calories burned in the gym flow straight to your nutrition dashboard. No manual entry.</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 items-center">
              <div className="rounded-xl bg-slate-900 p-5 text-white">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 border border-emerald-500/30 mb-3">
                  <Dumbbell size={14} className="text-emerald-400" />
                </div>
                <p className="font-bold text-sm mb-1">You finish a workout</p>
                <div className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-[11px] text-slate-400 font-mono mt-3">🔥 ~420 kcal burned</div>
              </div>
              <div className="flex sm:flex-col items-center justify-center gap-2">
                <div className="hidden sm:block h-px w-full bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                <div className="flex items-center gap-1.5 rounded-full bg-white border border-slate-200 shadow-sm px-3 py-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">auto-synced</span>
                  <ArrowRight size={11} className="text-emerald-500" />
                </div>
                <div className="hidden sm:block h-px w-full bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
              </div>
              <div className="rounded-xl bg-white border border-slate-200 p-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 border border-orange-200 mb-3">
                  <Utensils size={14} className="text-orange-500" />
                </div>
                <p className="font-bold text-sm text-slate-900 mb-1">Your nutrition updates</p>
                <div className="space-y-1.5 mt-3">
                  <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-1.5 text-[11px] text-slate-500 font-mono">Eaten: 1,850 kcal</div>
                  <div className="rounded-lg bg-orange-50 border border-orange-100 px-3 py-1.5 text-[11px] text-orange-600 font-mono">Burned: 420 · Net: 1,430</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────── */}
      <section id="features" className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight md:text-5xl">Built for consistency</h2>
            <p className="mx-auto max-w-2xl text-slate-600">
              Everything you need to train with structure, eat with intention, and stay on track week after week.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: 'Structured weekly training',
                desc: 'Follow clear workouts with sets, reps, and progression built around your goal.',
                icon: <Dumbbell className="text-slate-700" size={18} />
              },
              {
                title: 'Adaptive nutrition targets',
                desc: 'Calorie and macro targets adjust when your profile or objective changes.',
                icon: <CheckCircle2 className="text-slate-700" size={18} />
              },
              {
                title: 'Progress visibility',
                desc: 'Track your strength trend over time with PRs, streaks, and predicted 1RM.',
                icon: <ShieldCheck className="text-slate-700" size={18} />
              }
            ].map((f, i) => (
              <div key={i} className="rounded-3xl border border-slate-200 bg-white p-8">
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white">
                  {f.icon}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-slate-900">{f.title}</h3>
                <p className="leading-relaxed text-slate-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────── */}
      <section id="pricing" className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight md:text-5xl">Simple pricing</h2>
            <p className="mx-auto max-w-2xl text-slate-600">
              Start with a 7-day free trial — no credit card needed. Upgrade when you're ready.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
            <div className="flex flex-col rounded-3xl border border-slate-200 bg-white p-9">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Starter</h3>
              <div className="mb-8 flex items-baseline gap-2">
                <span className="text-5xl font-semibold">$0</span>
                <span className="text-slate-500">/ month</span>
              </div>

              <ul className="mb-10 flex-grow space-y-4">
                {[
                  'Calorie target calculation',
                  'Basic nutrition tracking',
                  'Workout and meal history',
                  'Profile management',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-slate-600">
                    <CheckCircle2 size={18} className="text-slate-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <Button asChild variant="outline" className="h-13 w-full rounded-2xl border-slate-300 text-slate-700 hover:bg-slate-50">
                <Link href="/login">Get Started Free</Link>
              </Button>
            </div>

            <div className="relative flex flex-col rounded-3xl border border-slate-900 bg-slate-900 p-9 text-white">
              <div className="absolute right-8 top-0 rounded-b-xl bg-emerald-400 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-900">
                7-day free trial
              </div>

              <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Premium</h3>
              <div className="mb-8 flex items-baseline gap-2">
                <span className="text-5xl font-semibold">$9</span>
                <span className="text-slate-300">/ month</span>
              </div>

              <ul className="mb-10 flex-grow space-y-4">
                {[
                  'Everything in Starter',
                  'History-aware AI workout plans',
                  'Exercise video demos & smart rest timer',
                  'Live PR detection & predicted 1RM',
                  'Calorie burn synced to nutrition',
                  'AI meal estimator & meal ideas',
                  'Custom macro & calorie targets',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-slate-100">
                    <CheckCircle2 size={18} className="text-emerald-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <Button asChild className="h-13 w-full rounded-2xl bg-white text-slate-900 hover:bg-slate-100">
                <Link href="/login">Start Free Trial</Link>
              </Button>
            </div>
          </div>

          <div className="mt-14 flex justify-center">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
              <ShieldCheck size={14} />
              <span>Secure billing via Stripe</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
