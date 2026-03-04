import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle2, Dumbbell, ShieldCheck } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const params = await searchParams
  
  // Handle password reset code from Supabase email
  // If code is present, redirect to reset-password with the code so client can handle it
  if (params?.code) {
    // Redirect to reset-password with the code parameter
    // The client component will exchange it for a session
    redirect(`/reset-password?code=${params.code}`)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-slate-200 bg-white p-2">
            <Dumbbell className="text-slate-800" size={18} />
          </div>
          <span className="text-lg font-semibold tracking-tight">Yunity Studio</span>
        </div>
        <div className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
          <Link href="#features" className="transition-colors hover:text-slate-900">Features</Link>
          <Link href="#pricing" className="transition-colors hover:text-slate-900">Pricing</Link>
          <Link href="/login" className="transition-colors hover:text-slate-900">Log in</Link>
          <Button asChild className="rounded-full bg-slate-900 px-6 text-white hover:bg-slate-800">
            <Link href="/login">Get Started</Link>
          </Button>
        </div>
      </nav>

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
            <Button variant="outline" size="lg" className="h-14 rounded-full border-slate-300 px-8 text-lg text-slate-700 hover:bg-white">
              See How It Works
            </Button>
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
            <span className="rounded-full border border-slate-200 bg-white px-4 py-1.5">Weekly plans</span>
            <span className="rounded-full border border-slate-200 bg-white px-4 py-1.5">Progress tracking</span>
            <span className="rounded-full border border-slate-200 bg-white px-4 py-1.5">Secure billing</span>
          </div>
        </div>
      </section>

      <section id="features" className="bg-white py-24">
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
                desc: 'Track your weight trend over time with filters and goal pacing guidance.',
                icon: <ShieldCheck className="text-slate-700" size={18} />
              }
            ].map((f, i) => (
              <div key={i} className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
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

      <section id="pricing" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight md:text-5xl">Simple pricing</h2>
            <p className="mx-auto max-w-2xl text-slate-600">
              Start free for tracking, then upgrade when you want full planning features.
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
                  'Profile Management'
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
              <div className="absolute right-8 top-0 rounded-b-xl bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-900">
                Popular
              </div>

              <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Premium</h3>
              <div className="mb-8 flex items-baseline gap-2">
                <span className="text-5xl font-semibold">$9</span>
                <span className="text-slate-300">/ month</span>
              </div>

              <ul className="mb-10 flex-grow space-y-4">
                {[
                  'Everything in Starter',
                  'Weekly workout generation',
                  'Personalized meal planning',
                  'Advanced progress analysis',
                  'Premium feature access'
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-slate-100">
                    <CheckCircle2 size={18} className="text-slate-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <Button asChild className="h-13 w-full rounded-2xl bg-white text-slate-900 hover:bg-slate-100">
                <Link href="/login">Upgrade to Premium</Link>
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