import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import MealPlanGenerator from '@/components/MealPlanGenerator'
import { Utensils, ChevronRight, Flame } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function NutritionPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  if (!profile) redirect('/onboarding')

  const { data: history } = await supabase
    .from('meal_plans')
    .select('id, name, created_at, plan')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const latestPlan = history && history.length > 0 ? history[0].plan : null
  const olderPlans = history && history.length > 1 ? history.slice(1) : []

  const t = await getTranslations('nutrition')
  const tGoals = await getTranslations('goals')

  const goalLabel: Record<string, string> = {
    lose: tGoals('lose'),
    maintain: tGoals('maintain'),
    gain: tGoals('gain'),
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">

      {/* ── Hero Header ─────────────────────────────────── */}
      <header className="relative rounded-2xl overflow-hidden bg-slate-900 px-5 py-7 sm:px-8 sm:py-9">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-orange-950" />
        <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-orange-500/5 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-amber-500/5 blur-2xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
          {/* Left: title */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2.5">
              {profile?.goal && (
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  {goalLabel[profile.goal] ?? profile.goal}
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{t('title')}</h1>
            <p className="text-slate-400 mt-1 text-sm">
              {t('daily_target')}: <span className="text-white font-bold">{profile.daily_calories_target} kcal</span>
            </p>
          </div>

          {/* Right: quick calorie target card */}
          <div className="rounded-xl bg-white/5 border border-white/10 px-5 py-4 text-center shrink-0">
            <p className="text-3xl font-black text-white">{profile.daily_calories_target}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mt-1">{t('daily_kcal')}</p>
          </div>
        </div>
      </header>

      {/* ── Meal Plan Generator ──────────────────────────── */}
      <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
          <Utensils size={15} className="text-orange-400" />
          <h2 className="font-bold text-slate-900">{t('plan_generator')}</h2>
        </div>
        <div className="p-5">
          <MealPlanGenerator calories={profile.daily_calories_target} initialPlan={latestPlan} />
        </div>
      </section>

      {/* ── Recent Plans ─────────────────────────────────── */}
      {olderPlans.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">{t('recent_plans')}</h2>
          <div className="grid gap-2">
            {olderPlans.map((mp) => (
              <Link key={mp.id} href={`/dashboard/nutrition/meal-plan/${mp.id}`} className="group block">
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3.5 transition-all hover:border-slate-300 hover:shadow-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 shrink-0 transition-colors group-hover:bg-slate-900">
                      <Utensils size={14} className="text-slate-500 group-hover:text-orange-400 transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate text-sm">{mp.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-400">
                          {new Date(mp.created_at).toLocaleDateString()}
                        </span>
                        {mp.plan?.total_macros?.protein && (
                          <span className="flex items-center gap-0.5 text-xs font-medium text-rose-500">
                            <Flame size={10} /> {mp.plan.total_macros.protein}g protein
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 shrink-0 ml-3 transition-all group-hover:translate-x-0.5 group-hover:text-slate-500" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {history?.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl">
          <Utensils size={36} className="mx-auto text-slate-300 mb-3" />
          <p className="font-bold text-slate-700">{t('no_plans')}</p>
          <p className="text-slate-400 text-sm mt-1">{t('generate_first')}</p>
        </div>
      )}
    </div>
  )
}
