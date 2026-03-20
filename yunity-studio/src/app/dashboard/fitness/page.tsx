import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CollapsiblePlan } from '@/components/CollapsiblePlan'
import { CollapsibleArchive } from '@/components/CollapsibleArchive'
import { Calendar, Zap, BedDouble, TrendingUp, Play, Flame } from 'lucide-react'

import { getTodayPlanContext } from './fitness-actions'
import { ExerciseVideoButton } from '@/components/ExerciseVideoModal'
import { getTranslations } from 'next-intl/server'
import { getTrialStatus } from '@/utils/trial'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function FitnessPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  const [profileRes, workoutsRes, todayLogsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('workouts').select('id, name, created_at, plan').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
    supabase.from('workout_logs').select('calories_burned').eq('user_id', user.id).gte('created_at', today),
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
  const cookieStore = await cookies()
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
  const todayName = DAY_NAMES[new Date().getDay()]
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

          {/* Right: Today's context card */}
          {todayContext && (
            <div className="w-full sm:w-72 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0">
              {/* Card header */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10">
                {todayContext.isRest ? (
                  <>
                    <BedDouble size={13} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-300">{tCommon('rest_day')}</span>
                    <span className="text-xs text-slate-500 ml-auto">
                      {activeDayIndex !== undefined ? `Day ${activeDayIndex + 1}` : todayContext.dayName}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="relative flex h-1.5 w-1.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                    <span className="text-xs font-bold text-slate-300 truncate">
                      {activeDayIndex !== undefined ? `Day ${activeDayIndex + 1}` : todayContext.dayName} — {todayContext.focus}
                    </span>
                  </>
                )}
              </div>

              {/* Exercise rows */}
              {!todayContext.isRest && (
                <div className="divide-y divide-white/5">
                  {todayContext.exercises.map(ex => (
                    <div key={ex.name} className="flex items-center justify-between gap-2 px-4 py-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs text-slate-400 truncate">{ex.name}</span>
                        <ExerciseVideoButton exerciseName={ex.name} />
                      </div>
                      <div className="shrink-0 text-right">
                        {ex.last ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-slate-300">
                              {ex.last.weight}{ex.last.unit}×{ex.last.reps}
                            </span>
                            {ex.suggestWeight && (
                              <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 rounded px-1.5 py-0.5">
                                <TrendingUp size={9} /> {ex.suggestWeight}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">{ex.target}</span>
                        )}
                        {ex.allTimePR && (
                          <p className="text-[10px] text-amber-400/70 text-right">
                            PR {ex.allTimePR.weight}{ex.last?.unit ?? 'kg'}×{ex.allTimePR.reps}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  {todayContext.hasHistory && todayContext.totalVolumeLastSession > 0 && (
                    <div className="px-4 py-2 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wide">Last session vol.</span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {todayContext.totalVolumeLastSession.toLocaleString()} kg
                      </span>
                    </div>
                  )}

                  {!todayContext.hasHistory && (
                    <div className="px-4 py-2 text-center">
                      <p className="text-[10px] text-slate-500">{t('log_to_track')}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Start Today's Workout CTA */}
              {canStartToday ? (
                <Link
                  href={`/dashboard/fitness/workout/${latestWorkoutId}/log/${todayDayIndex}`}
                  className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-400 transition-colors px-4 py-2.5 text-sm font-bold text-white"
                >
                  <Play size={13} fill="white" /> {t('start_workout')}
                </Link>
              ) : todayContext.isRest ? (
                <div className="px-4 py-3 text-center">
                  <p className="text-xs text-slate-500">{t('recover')}</p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </header>

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
