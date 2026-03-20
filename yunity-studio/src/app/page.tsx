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
            <h2 className="mb-4 text-3xl font-semibold tracking-tight md:text-5xl">How it works</h2>
            <p className="mx-auto max-w-2xl text-slate-600">
              From your first session to long-term results — here's how Yunity keeps improving with you.
            </p>
          </div>

          {/* Steps */}
          <div className="relative grid gap-8 md:grid-cols-4 mb-20">
            {[
              { step: '01', icon: <Brain size={20} className="text-violet-600" />, color: 'bg-violet-50 border-violet-200', title: 'Set your goal', desc: 'Tell us your target — lose fat, build muscle, or maintain. We calibrate your calorie target, macros, and plan intensity around it.' },
              { step: '02', icon: <Sparkles size={20} className="text-emerald-600" />, color: 'bg-emerald-50 border-emerald-200', title: 'Get a plan built for you', desc: 'AI reads your PR history, recent session volume, and past plans before generating your next workout — not a generic template.' },
              { step: '03', icon: <Dumbbell size={20} className="text-blue-600" />, color: 'bg-blue-50 border-blue-200', title: 'Train, log & eat right', desc: 'Log sets in real time. Calories burned flow straight to your nutrition dashboard. Your net intake updates the moment you finish.' },
              { step: '04', icon: <TrendingUp size={20} className="text-amber-600" />, color: 'bg-amber-50 border-amber-200', title: 'Get smarter every week', desc: 'Each session adds to your history. The next plan you generate will know your new PRs, new volume baseline, and what to push next.' },
            ].map((s) => (
              <div key={s.step} className="flex flex-col gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${s.color}`}>
                  {s.icon}
                </div>
                <span className="text-xs font-bold tracking-widest text-slate-400">{s.step}</span>
                <h3 className="text-lg font-semibold text-slate-900">{s.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* ── Personalization Spotlight ── */}
          <div className="mb-20 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 p-8 sm:p-12">
            <div className="flex flex-col lg:flex-row gap-10 items-start">
              <div className="flex-1">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400 uppercase tracking-widest mb-5">
                  <Sparkles size={11} /> AI Personalization
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight">
                  Every plan remembers<br />what you've done
                </h3>
                <p className="text-slate-400 leading-relaxed mb-8 max-w-md">
                  Most fitness apps give everyone the same generic template. Before generating your next plan, Yunity reads your actual training history — so every new week is built specifically for where you are right now.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Your PR records', desc: 'Knows your strongest lifts' },
                    { label: 'Recent session volume', desc: 'How hard you trained last week' },
                    { label: 'Previous plan structure', desc: 'Builds on what worked' },
                    { label: 'Your goal', desc: 'Fat loss, maintain, or gain' },
                  ].map(item => (
                    <div key={item.label} className="rounded-xl bg-white/5 border border-white/10 p-3.5">
                      <p className="text-xs font-bold text-white">{item.label}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 w-full space-y-3">
                <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain size={13} className="text-violet-400" />
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">AI reads your training data</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      '🏋️ Bench Press PR: 90 kg × 5 — set last week',
                      '📈 Squat volume up 15% over 3 sessions',
                      '🔁 Previous split: Push / Pull / Legs, 6 days',
                      '💪 Shoulder press stalled — needs a reset',
                    ].map(line => (
                      <div key={line} className="text-[11px] text-slate-400 bg-slate-800/60 rounded-lg px-3 py-2 font-mono">{line}</div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-center py-1">
                  <div className="flex items-center gap-2 text-emerald-500/60">
                    <div className="h-px w-16 bg-emerald-500/30" />
                    <ArrowRight size={15} className="text-emerald-400" />
                    <span className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest">generates your next plan</span>
                    <div className="h-px w-16 bg-emerald-500/30" />
                  </div>
                </div>

                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={13} className="text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-300">Your personalised next plan</span>
                  </div>
                  <p className="text-[12px] text-slate-400 leading-relaxed">Progressive overload baked in. Volume calibrated to your recovery. Stalled lifts swapped or deloaded. Exercises you respond well to kept in.</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Workout Features ── */}
          <div className="mb-16">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900">
                <Dumbbell size={15} className="text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Workout — built for progression</h3>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-600">Premium</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: <Sparkles size={16} className="text-violet-500" />, title: 'History-aware AI plan', desc: 'Reads your PRs, recent volume, and past plans before generating your next split — so it always moves you forward.' },
                { icon: <SlidersHorizontal size={16} className="text-emerald-500" />, title: 'Fully customisable days', desc: 'Choose which day to follow, reorder, remove exercises you hate, or add new ones. Your plan, your rules.' },
                { icon: <Play size={16} className="text-blue-500" />, title: 'Exercise video demos', desc: 'Every exercise has a built-in tutorial so you always know exactly how to perform it safely.' },
                { icon: <Timer size={16} className="text-indigo-500" />, title: 'Smart rest timer', desc: 'Rest periods automatically adapt — longer for big compounds like squats, shorter for isolation moves.' },
                { icon: <Trophy size={16} className="text-amber-500" />, title: 'Live PR detection', desc: 'Hit a personal best mid-workout and we flag it instantly. All-time PRs tracked per exercise.' },
                { icon: <CalendarDays size={16} className="text-slate-500" />, title: "Today's plan at a glance", desc: "Your dashboard shows today's exercises, last session's weights, and the exact progressive overload to aim for." },
              ].map((f) => (
                <div key={f.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white">
                    {f.icon}
                  </div>
                  <h4 className="mb-1.5 text-sm font-semibold text-slate-900">{f.title}</h4>
                  <p className="text-xs leading-relaxed text-slate-500">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Progress Features ── */}
          <div className="mb-16">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900">
                <BarChart2 size={15} className="text-violet-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Progress — data that actually means something</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: <Flame size={16} className="text-orange-500" />, title: 'Calorie burn estimate', desc: 'Every session automatically calculates calories burned using the MET formula — and feeds it to your nutrition dashboard.' },
                { icon: <Trophy size={16} className="text-amber-500" />, title: 'PR history', desc: 'Every personal record logged for every exercise, forever. The AI uses these when building your next plan.' },
                { icon: <TrendingUp size={16} className="text-emerald-500" />, title: 'Volume trends', desc: 'See how your total weekly training volume compares to last week — the clearest signal of real progress.' },
                { icon: <BarChart2 size={16} className="text-violet-500" />, title: 'Predicted 1RM', desc: 'Based on your logged sets, we estimate your 1-rep max per exercise and track it over time.' },
              ].map((f) => (
                <div key={f.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white">
                    {f.icon}
                  </div>
                  <h4 className="mb-1.5 text-sm font-semibold text-slate-900">{f.title}</h4>
                  <p className="text-xs leading-relaxed text-slate-500">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Ecosystem ── */}
          <div className="mb-16 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 sm:p-12">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-500 mb-4">
                <Link2 size={12} /> Workout + Nutrition
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">One ecosystem that works as one</h3>
              <p className="text-slate-500 text-sm max-w-xl mx-auto">
                Your training and diet don't live in separate silos. Calories you burn in the gym automatically update your nutrition targets — so your net intake is always accurate.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 items-start">
              <div className="rounded-2xl bg-slate-900 p-6 text-white">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30 mb-4">
                  <Dumbbell size={16} className="text-emerald-400" />
                </div>
                <h4 className="font-bold text-white mb-1.5">You train</h4>
                <p className="text-xs text-slate-400 leading-relaxed">Log your sets and finish the session. Yunity estimates calories burned from your exercises, sets completed, and body weight.</p>
                <div className="mt-4 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-[11px] text-slate-400 font-mono">
                  🔥 ~420 kcal burned
                </div>
              </div>

              <div className="flex sm:flex-col items-center justify-center gap-3 py-4 sm:py-0">
                <div className="hidden sm:block h-px w-full bg-gradient-to-r from-slate-200 via-emerald-300 to-slate-200" />
                <div className="flex items-center gap-1.5 rounded-full bg-white border border-slate-200 shadow-sm px-3 py-1.5">
                  <ArrowRight size={13} className="text-emerald-500 hidden sm:block" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">auto-synced</span>
                  <ArrowRight size={13} className="text-emerald-500 hidden sm:block" />
                </div>
                <div className="hidden sm:block h-px w-full bg-gradient-to-r from-slate-200 via-orange-300 to-slate-200" />
              </div>

              <div className="rounded-2xl bg-white border border-slate-200 p-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-200 mb-4">
                  <Utensils size={16} className="text-orange-500" />
                </div>
                <h4 className="font-bold text-slate-900 mb-1.5">Your nutrition updates</h4>
                <p className="text-xs text-slate-500 leading-relaxed">Your nutrition dashboard shows calories eaten, burned, and your true net intake — so you know exactly how much fuel you need to recover and grow.</p>
                <div className="mt-4 space-y-1.5">
                  <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-1.5 text-[11px] text-slate-500 font-mono">Eaten: 1,850 kcal</div>
                  <div className="rounded-lg bg-orange-50 border border-orange-100 px-3 py-1.5 text-[11px] text-orange-600 font-mono">Burned: 420 kcal · Net: 1,430</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Nutrition Features ── */}
          <div>
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900">
                <Utensils size={15} className="text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Nutrition — eat with intention</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: <Brain size={16} className="text-violet-500" />, title: 'AI nutrition estimator', desc: 'Type what you ate in plain language — "2 eggs and toast" — and AI estimates the calories and macros instantly.' },
                { icon: <Sparkles size={16} className="text-emerald-500" />, title: 'Meal idea generator', desc: 'Stuck on what to eat? Get 3 AI-suggested meals for any slot, calibrated to your remaining macros for the day.' },
                { icon: <CheckCircle2 size={16} className="text-blue-500" />, title: 'Custom macro targets', desc: 'Set your own protein, carb, and fat targets. Or let us derive them from your calorie goal automatically.' },
                { icon: <CalendarDays size={16} className="text-amber-500" />, title: 'Daily meal log', desc: 'Add, edit, or delete any meal throughout the day. Totals update in real time with a visual calorie progress bar.' },
              ].map((f) => (
                <div key={f.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white">
                    {f.icon}
                  </div>
                  <h4 className="mb-1.5 text-sm font-semibold text-slate-900">{f.title}</h4>
                  <p className="text-xs leading-relaxed text-slate-500">{f.desc}</p>
                </div>
              ))}
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
