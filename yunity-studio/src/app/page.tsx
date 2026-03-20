import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  ArrowRight, CheckCircle2, Dumbbell, ShieldCheck,
  Zap, TrendingUp, Utensils, Play, Trophy, BarChart2,
  CalendarDays, Brain, Timer, Flame
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
              From setup to your first PR — here's everything Yunity does for you.
            </p>
          </div>

          {/* Steps */}
          <div className="relative grid gap-8 md:grid-cols-4 mb-20">
            {[
              { step: '01', icon: <Brain size={20} className="text-violet-600" />, color: 'bg-violet-50 border-violet-200', title: 'Set your goal', desc: 'Tell us your target — lose fat, build muscle, or maintain. We calibrate everything around it.' },
              { step: '02', icon: <Zap size={20} className="text-emerald-600" />, color: 'bg-emerald-50 border-emerald-200', title: 'Get your AI plan', desc: 'Premium users get a personalised 7-day workout split and daily meal plan generated by AI in seconds.' },
              { step: '03', icon: <Dumbbell size={20} className="text-blue-600" />, color: 'bg-blue-50 border-blue-200', title: 'Train & log', desc: 'Follow your plan set by set. Log weight and reps, watch the rest timer, and see your PRs in real time.' },
              { step: '04', icon: <TrendingUp size={20} className="text-amber-600" />, color: 'bg-amber-50 border-amber-200', title: 'Track progress', desc: 'Streaks, volume trends, estimated 1RMs, and predicted improvements — all in your progress dashboard.' },
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
                { icon: <Brain size={16} className="text-violet-500" />, title: 'AI-generated 7-day split', desc: 'Personalised workout plan built around your goal, with exercise selection, sets, reps, and coaching tips.' },
                { icon: <Play size={16} className="text-emerald-500" />, title: 'Exercise video demos', desc: 'Every exercise has a built-in tutorial video so you always know exactly how to perform it safely.' },
                { icon: <Timer size={16} className="text-blue-500" />, title: 'Smart rest timer', desc: 'Rest periods automatically adapt — longer for big compounds like squats, shorter for isolation moves.' },
                { icon: <Trophy size={16} className="text-amber-500" />, title: 'Live PR detection', desc: 'Hit a personal best mid-workout and we flag it instantly. Your all-time PRs are always one tap away.' },
                { icon: <CalendarDays size={16} className="text-indigo-500" />, title: "Today's plan at a glance", desc: "See today's exercises, your last session's weights, and a progressive overload suggestion right on the dashboard." },
                { icon: <Zap size={16} className="text-slate-500" />, title: 'Custom exercise add-on', desc: 'Add any exercise mid-session from a library of 100+ movements, filtered by muscle group.' },
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
                { icon: <Flame size={16} className="text-orange-500" />, title: 'Workout streak', desc: 'Keep your streak alive. Consistent sessions are the #1 predictor of long-term results.' },
                { icon: <Trophy size={16} className="text-amber-500" />, title: 'PR history', desc: 'Every personal record logged for every exercise, with the date it was set.' },
                { icon: <TrendingUp size={16} className="text-emerald-500" />, title: 'Volume trends', desc: 'See how your total weekly training volume compares to last week — are you progressing?' },
                { icon: <BarChart2 size={16} className="text-violet-500" />, title: 'Predicted 1RM', desc: 'Based on your logged sets, we project your estimated 1-rep max 30 and 90 days out.' },
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

          {/* ── Nutrition Features ── */}
          <div>
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900">
                <Utensils size={15} className="text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Nutrition — eat with intention</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: <Brain size={16} className="text-violet-500" />, title: 'AI meal plan generator', desc: 'Get a full-day meal plan with breakfast, lunch, dinner, and snacks tailored to your calorie and macro targets.' },
                { icon: <CheckCircle2 size={16} className="text-emerald-500" />, title: 'Calorie & macro targets', desc: 'Your daily targets are calculated from your weight, height, goal, and activity level — and update when you do.' },
                { icon: <CalendarDays size={16} className="text-blue-500" />, title: 'Meal plan history', desc: 'Every plan you generate is saved so you can revisit past meals and rotate through your favourites.' },
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
                  'AI-generated 7-day workout split',
                  'Personalised daily meal plans',
                  'Exercise video demos',
                  'Live PR detection & streak tracking',
                  'Predicted 1RM & volume trends',
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
