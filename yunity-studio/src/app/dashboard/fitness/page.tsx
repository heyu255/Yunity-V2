import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CollapsiblePlan } from '@/components/CollapsiblePlan'
import { CollapsibleArchive } from '@/components/CollapsibleArchive'
import { TodayWorkoutCard } from '@/components/TodayWorkoutCard'
import { Calendar, Zap, Flame, Dumbbell } from 'lucide-react'

import { getTodayPlanContext } from './fitness-actions'
import { getTranslations } from 'next-intl/server'
import { getTrialStatus } from '@/utils/trial'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function FitnessPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const cookieStore = await cookies()
  const localDate = cookieStore.get('yunity_local_date')?.value ?? new Date().toISOString().split('T')[0]

  const [profileRes, workoutsRes, todayLogsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('workouts').select('id, name, created_at, plan').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
    supabase.from('workout_logs').select('calories_burned').eq('user_id', user.id).gte('created_at', localDate),
  ])

  const todayCaloriesBurned = (todayLogsRes.data ?? [])
    .reduce((sum, log) => sum + (log.calories_burned ?? 0), 0)

  const profile = profileRes.data
  const isPremiumDb = profile?.is_premium ?? false
  const { isOnTrial } = getTrialStatus(user.created_at)
  const isPremium = isPremiumDb || isOnTrial
  const allWorkouts = workoutsRes.data ?? []

  const latestWorkout = allWorkouts.length > 0 ? allWorkouts[0].plan : null
  const latestWorkoutId = allWorkouts.length > 0 ? allWorkouts[0].id : null
  const latestWorkoutName = allWorkouts.length > 0 ? allWorkouts[0].name : null
  const olderWorkouts = allWorkouts.length > 1 ? allWorkouts.slice(1) : []

  // Check if user manually selected a day via the plan picker
  const activeDayCookie = cookieStore.get('yunity_active_day')?.value
  let activeDayIndex: number | undefined
  if (activeDayCookie && latestWorkoutId) {
    const [cId, cIdx] = activeDayCookie.split(':')
    if (cId === latestWorkoutId) {
      const parsed = parseInt(cIdx)
      if (!isNaN(parsed) && parsed >= 0 && parsed < (latestWorkout?.days?.length ?? 0)) {
        activeDayIndex = parsed
      }
    }
  }

  const todayContext = latestWorkout?.days ? await getTodayPlanContext(latestWorkout.days, activeDayIndex) : null

  // Find today's day index (override with user selection if present)
  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const [ly, lm, ld] = localDate.split('-').map(Number)
  const todayName = DAY_NAMES[new Date(Date.UTC(ly, lm - 1, ld)).getUTCDay()]
  const todayDayIndex = activeDayIndex ?? (latestWorkout?.days?.findIndex((d: any) => d.day === todayName) ?? -1)

  const canStartToday = todayContext && !todayContext.isRest && todayDayIndex >= 0 && latestWorkoutId

  const t = await getTranslations('fitness')
  const tCommon = await getTranslations('common')
  const tGoals = await getTranslations('goals')

  const goalLabel: Record<string, string> = {
    lose: tGoals('lose'),
    maintain: tGoals('maintain'),
    gain: tGoals('gain'),
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">

      {/* ── Hero Header ─────────────────────────────────── */}
      <header className="relative rounded-2xl overflow-hidden bg-slate-900 px-5 py-7 sm:px-8 sm:py-9">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950" />
        <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-emerald-500/5 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-violet-500/5 blur-2xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">

          {/* Left: title */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2.5">
              {isPremiumDb && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                  <Zap size={10} /> Premium
                </span>
              )}
              {!isPremiumDb && isOnTrial && (
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/20 border border-violet-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-violet-400">
                  <Zap size={10} /> Free Trial
                </span>
              )}
              {profile?.goal && (
                <Link
                  href="/dashboard/account"
                  className="rounded-full bg-white/10 hover:bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {goalLabel[profile.goal] ?? profile.goal}
                </Link>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{t('title')}</h1>
            <p className="text-slate-400 mt-1 text-sm">
              {isPremium ? t('subtitle_premium') : t('subtitle_free')}
            </p>
            {todayCaloriesBurned > 0 && (
              <div className="inline-flex items-center gap-1.5 mt-3 rounded-full bg-orange-500/15 border border-orange-500/25 px-3 py-1">
                <Flame size={12} className="text-orange-400" />
                <span className="text-xs font-bold text-orange-300">~{todayCaloriesBurned} kcal burned today</span>
              </div>
            )}
          </div>

          {/* Right: Today's context card — client component, refreshes on plan edits */}
          {todayContext && (
            <TodayWorkoutCard
              initialContext={todayContext}
              workoutId={latestWorkoutId}
              activeDayIndex={activeDayIndex}
              todayDayIndex={todayDayIndex}
              labels={{
                restDay: tCommon('rest_day'),
                startWorkout: t('start_workout'),
                recover: t('recover'),
                logToTrack: t('log_to_track'),
              }}
            />
          )}
        </div>
      </header>

      {/* ── Free Workout ─────────────────────────────────── */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-500">
            <Dumbbell size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Free Workout</p>
            <p className="text-xs text-slate-400">Pick your own exercises</p>
          </div>
        </div>
        <Link
          href="/dashboard/fitness/workout/free"
          className="rounded-lg bg-violet-500 hover:bg-violet-600 text-white text-xs font-bold px-4 py-2 transition-colors"
        >
          Start
        </Link>
      </div>

      {/* ── Collapsible Plan ─────────────────────────────── */}
      <CollapsiblePlan
        isPremium={isPremium}
        goal={profile?.goal}
        initialPlan={latestWorkout}
        initialPlanName={latestWorkoutName}
        workoutId={latestWorkoutId}
      />


      {/* ── Plan Archive ─────────────────────────────────── */}
      <CollapsibleArchive workouts={olderWorkouts} />

      {allWorkouts.length === 0 && !isPremium && (
        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl">
          <Calendar size={36} className="mx-auto text-slate-300 mb-3" />
          <p className="font-bold text-slate-700">No plans yet</p>
          <p className="text-slate-400 text-sm mt-1">Upgrade to premium to generate your first AI plan</p>
        </div>
      )}
    </div>
  )
}
