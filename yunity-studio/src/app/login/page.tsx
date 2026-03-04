import { login, signUp, forgotPassword } from './actions'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Dumbbell, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import BackNavigation from './BackNavigation'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 px-6 lg:grid-cols-2 lg:gap-12">
        <section className="hidden items-center lg:flex">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2">
              <div className="rounded-lg border border-slate-200 bg-slate-100 p-1.5">
                <Dumbbell size={18} className="text-slate-700" />
              </div>
              <span className="text-sm font-medium text-slate-700">Yunity Studio</span>
            </div>
            <h1 className="text-5xl font-semibold tracking-tight text-slate-900">
              Welcome back.
              <br />
              Continue your plan.
            </h1>
            <p className="max-w-md text-lg text-slate-600">
              A clean dashboard for workouts, nutrition targets, and measurable progress.
            </p>
            <div className="grid max-w-md grid-cols-2 gap-4 text-sm">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-slate-500">Plan cadence</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">7-day</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-slate-500">Progress tracking</p>
                <p className="mt-2 flex items-center gap-2 text-xl font-semibold text-slate-900">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500/60" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                  </span>
                  Live
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center py-10 lg:py-0">
          <div className="w-full max-w-md space-y-7">
            <BackNavigation />
            <div className="space-y-2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 lg:hidden">
                <Dumbbell size={14} className="text-slate-700" />
                Yunity Studio
              </div>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Sign in</h2>
              <p className="text-slate-600">Access your account and continue where you left off.</p>
            </div>

            <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
              <CardHeader className="pb-4">
                {params?.error && (
                  <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                    <p className="text-center text-sm font-semibold text-red-600">
                      {params.error}
                    </p>
                  </div>
                )}
                {params?.message && (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                    <p className="text-center text-sm font-semibold text-emerald-600">
                      {params.message}
                    </p>
                  </div>
                )}
              </CardHeader>

              <CardContent>
                <form id="login-form" className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="ml-1 text-slate-700">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      required
                      className="h-12 rounded-xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-slate-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="ml-1 flex items-center justify-between">
                      <Label htmlFor="password" className="text-slate-700">Password</Label>
                      <button
                        type="submit"
                        formAction={forgotPassword}
                        className="text-xs font-medium text-slate-600 transition-colors hover:text-slate-900"
                      >
                        Forgot?
                      </button>
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      className="h-12 rounded-xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-slate-400"
                    />
                  </div>

                  <div className="flex flex-col gap-3 pt-4">
                    <Button
                      formAction={login}
                      className="group flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                    >
                      Log In
                      <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
                    </Button>

                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-slate-400">New to Yunity?</span>
                      </div>
                    </div>

                    <Button
                      formAction={signUp}
                      variant="outline"
                      className="h-12 rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      Create Account
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <footer className="px-4 text-center text-xs leading-relaxed text-slate-400 lg:text-left">
              By continuing, you agree to our{' '}
              <Link href="#" className="underline underline-offset-2 hover:text-slate-600">Terms</Link> and{' '}
              <Link href="#" className="underline underline-offset-2 hover:text-slate-600">Privacy Policy</Link>.
            </footer>
          </div>
        </section>
      </div>
    </div>
  )
}