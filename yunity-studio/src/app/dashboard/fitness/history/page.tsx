import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { Dumbbell, Trophy, TrendingUp, Flame, BarChart3, Zap, Calendar, Target, Award, AlertTriangle } from 'lucide-react'
import { getWorkoutHistory, getPersonalRecords } from '../fitness-actions'
import { getTranslations } from 'next-intl/server'
import { ExerciseChart } from './exercise-chart'
import { CollapsibleSessionLog } from './CollapsibleSessionLog'
import { ResetWorkoutButton } from './ResetWorkoutButton'
import { computeStreak, computeWeekVolume, topMuscleGroup, daysSinceLastWorkout } from '@/lib/fitness-stats'

export const dynamic = 'force-dynamic'

const medals = ['🥇', '🥈', '🥉']

export default async function WorkoutHistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const cookieStore = await cookies()
  const localDate = cookieStore.get('yunity_local_date')?.value

  const [history, prs] = await Promise.all([
    getWorkoutHistory(40),
    getPersonalRecords(),
  ])

  const exerciseNames = [...new Set(
    history.flatMap(log => (log.exercise_logs ?? []).map((ex: any) => ex.name).filter(Boolean))
  )].sort() as string[]

  const grouped: Record<string, typeof history> = {}
  for (const log of history) {
    const date = log.created_at.split('T')[0]
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(log)
  }
  const sessionGroups = Object.entries(grouped)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, logs]) => ({ date, logs }))

  const prEntries = Object.entries(prs).sort((a, b) => b[1].oneRM - a[1].oneRM)

  const lifetimeVolume = history.reduce((sum, log) => {
    for (const ex of log.exercise_logs ?? []) {
      for (const set of ex.sets ?? []) {
        if (set.completed && set.weight && set.reps) sum += set.weight * set.reps
      }
    }
    return sum
  }, 0)

  // Insights
  const streak = computeStreak(history, localDate)
  const thisWeekVol = computeWeekVolume(history, 0)
  const lastWeekVol = computeWeekVolume(history, 1)
  const volDelta = lastWeekVol > 0 ? Math.round(((thisWeekVol - lastWeekVol) / lastWeekVol) * 100) : null
  const topMuscle = topMuscleGroup(history)
  const daysSince = daysSinceLastWorkout(history)
  const thisWeekSessions = history.filter(l => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    return new Date(l.created_at) >= startOfWeek
  }).length

  const t = await getTranslations('progress')

  const firstSession = history.length > 0 ? new Date(history[history.length - 1].created_at) : null
  const weeksSinceFirst = firstSession
    ? Math.max(1, (Date.now() - firstSession.getTime()) / (7 * 86400000))
    : 1
  const avgPerWeek = history.length > 0 ? Math.round((history.length / weeksSinceFirst) * 10) / 10 : 0

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">

      {/* ── Hero Header ─────────────────────────────────── */}
      <header className="relative rounded-2xl overflow-hidden bg-slate-900 px-6 py-8">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-violet-950" />
        <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-violet-500/5 blur-2xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <TrendingUp size={14} className="text-violet-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Progress</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">{t('title')}</h1>
            <p className="text-slate-400 text-sm mt-1">{t('hero_subtitle', { sessions: history.length, prs: prEntries.length })}</p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-center min-w-[80px]">
              <p className="text-2xl font-black text-white">{streak}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mt-0.5">{t('hero_streak')}</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-center min-w-[80px]">
              <p className="text-2xl font-black text-white">{prEntries.length}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mt-0.5">{t('hero_prs')}</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-center min-w-[80px]">
              <p className="text-2xl font-black text-white">{avgPerWeek}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mt-0.5">{t('hero_avg')}</p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Insights ────────────────────────────────────── */}
      {history.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-violet-400" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Insights</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Streak */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-1.5 mb-2">
                <Flame size={13} className={streak >= 3 ? 'text-orange-400' : 'text-slate-300'} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Streak</span>
              </div>
              <p className="text-2xl font-black text-slate-900">{streak}</p>
              <p className="text-xs text-slate-400 mt-0.5">{streak === 1 ? 'day' : 'days'} in a row</p>
            </div>

            {/* This week */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-1.5 mb-2">
                <Calendar size={13} className="text-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">This Week</span>
              </div>
              <p className="text-2xl font-black text-slate-900">{thisWeekSessions}</p>
              <p className="text-xs text-slate-400 mt-0.5">session{thisWeekSessions !== 1 ? 's' : ''}</p>
            </div>

            {/* Volume vs last week */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingUp size={13} className="text-violet-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vol. vs Last Wk</span>
              </div>
              {thisWeekVol > 0 ? (
                <>
                  <p className="text-2xl font-black text-slate-900">
                    {thisWeekVol >= 1000 ? `${(thisWeekVol / 1000).toFixed(1)}k` : thisWeekVol}
                  </p>
                  {volDelta !== null && (
                    <p className={`text-xs font-semibold mt-0.5 ${volDelta > 0 ? 'text-emerald-500' : volDelta < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                      {volDelta > 0 ? `+${volDelta}%` : volDelta < 0 ? `${volDelta}%` : 'same'} vs last week
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-slate-400 mt-1">No sessions yet this week</p>
              )}
            </div>

            {/* Most trained / days since */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              {daysSince !== null && daysSince > 2 ? (
                <>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Target size={13} className="text-rose-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Last Workout</span>
                  </div>
                  <p className="text-2xl font-black text-slate-900">{daysSince}</p>
                  <p className="text-xs text-slate-400 mt-0.5">days ago — get back at it!</p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Award size={13} className="text-amber-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Top Muscle</span>
                  </div>
                  <p className="text-sm font-black text-slate-900 leading-tight mt-1">{topMuscle ?? '—'}</p>
                  <p className="text-xs text-slate-400 mt-0.5">most trained</p>
                </>
              )}
            </div>
          </div>

          {/* Extra callout when on a streak */}
          {streak >= 3 && (
            <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 flex items-center gap-3">
              <span className="text-xl">🔥</span>
              <p className="text-sm font-semibold text-orange-800">
                {streak}-day streak! Keep the momentum going.
              </p>
            </div>
          )}

          {/* Volume trend callout */}
          {volDelta !== null && volDelta >= 10 && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-center gap-3">
              <span className="text-xl">📈</span>
              <p className="text-sm font-semibold text-emerald-800">
                Volume is up {volDelta}% vs last week — you're progressing well!
              </p>
            </div>
          )}
        </section>
      )}

      {/* ── Personal Records ────────────────────────────── */}
      {prEntries.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
            <Trophy size={16} className="text-amber-500" />
            <h2 className="font-bold text-slate-900">Personal Records</h2>
            <span className="ml-auto text-xs font-semibold text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
              {prEntries.length}
            </span>
          </div>
          <div className="divide-y divide-slate-50">
            {prEntries.map(([name, pr], i) => (
              <div
                key={name}
                className={`flex items-center gap-3 px-5 py-3.5 ${i === 0 ? 'bg-amber-50/60' : i === 1 ? 'bg-slate-50/40' : ''}`}
              >
                <span className="text-lg w-7 shrink-0 text-center">{medals[i] ?? ''}</span>
                <span className="text-sm font-medium text-slate-700 capitalize truncate min-w-0 flex-1">{name}</span>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-slate-900">{pr.weight}{pr.unit} × {pr.reps}</p>
                  <p className="text-xs text-slate-400">~{Math.round(pr.oneRM * 10) / 10} 1RM</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Exercise Progression ────────────────────────── */}
      {exerciseNames.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
            <BarChart3 size={16} className="text-violet-500" />
            <div>
              <h2 className="font-bold text-slate-900">Exercise Progression</h2>
              <p className="text-xs text-slate-400">Max weight per session</p>
            </div>
          </div>
          <div className="p-5">
            <ExerciseChart exerciseNames={exerciseNames} />
          </div>
        </section>
      )}

      {/* ── Session Log ─────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Flame size={15} className="text-orange-400" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Session Log</h2>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl">
            <Dumbbell size={40} className="mx-auto text-slate-300 mb-4" />
            <p className="font-bold text-slate-600">No workouts logged yet</p>
            <p className="text-slate-400 text-sm mt-1">Start a workout from the Fitness tab</p>
          </div>
        ) : (
          <CollapsibleSessionLog groups={sessionGroups} />
        )}
      </section>

      {/* ── Danger Zone ─────────────────────────────────── */}
      {history.length > 0 && (
        <section className="rounded-2xl border border-red-100 bg-white overflow-hidden shadow-sm">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-red-50">
            <AlertTriangle size={15} className="text-red-400" />
            <h2 className="font-bold text-slate-700 text-sm">Danger Zone</h2>
          </div>
          <div className="px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-700">Reset Workout Data</p>
              <p className="text-xs text-slate-400 mt-0.5">Permanently deletes all session logs, PRs, and workout plans.</p>
            </div>
            <ResetWorkoutButton />
          </div>
        </section>
      )}
    </div>
  )
}
