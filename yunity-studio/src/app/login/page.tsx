import { Card, CardContent } from "@/components/ui/card"
import { Dumbbell } from 'lucide-react'
import Link from 'next/link'
import BackNavigation from './BackNavigation'
import { LoginForm } from './LoginForm'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; tab?: string }>
}) {
  const params = await searchParams
  const defaultTab = params?.tab === 'signup' ? 'signup' : 'signin'

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 px-6 lg:grid-cols-2 lg:gap-12">

        {/* Left — branding (desktop only) */}
        <section className="hidden items-center lg:flex">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2">
              <div className="rounded-lg border border-slate-200 bg-slate-100 p-1.5">
                <Dumbbell size={18} className="text-slate-700" />
              </div>
              <span className="text-sm font-medium text-slate-700">Yunity Studio</span>
            </div>
            <h1 className="text-5xl font-semibold tracking-tight text-slate-900">
              Your plan.<br />Your progress.<br />Your way.
            </h1>
            <p className="max-w-md text-lg text-slate-600">
              AI-powered workout plans that learn from your history, paired with nutrition tracking that keeps everything in sync.
            </p>
            <div className="grid max-w-md grid-cols-3 gap-4 text-sm">
              {[
                { label: 'Free trial', value: '7 days' },
                { label: 'Plan cadence', value: 'Weekly' },
                { label: 'Tracking', value: 'Live' },
              ].map(s => (
                <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-slate-500 text-xs">{s.label}</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right — form */}
        <section className="flex items-center justify-center py-10 lg:py-0">
          <div className="w-full max-w-md space-y-6">
            <BackNavigation />

            {/* Mobile logo */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="rounded-lg border border-slate-200 bg-slate-100 p-1.5">
                <Dumbbell size={16} className="text-slate-700" />
              </div>
              <span className="text-sm font-medium text-slate-700">Yunity Studio</span>
            </div>

            <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
              <CardContent className="p-6 sm:p-8">
                <LoginForm
                  serverError={params?.error}
                  serverMessage={params?.message}
                  defaultTab={defaultTab}
                />
              </CardContent>
            </Card>

            <footer className="px-4 text-center text-xs leading-relaxed text-slate-400">
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
