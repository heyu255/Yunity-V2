'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Play, BedDouble, TrendingUp } from 'lucide-react'
import { ExerciseVideoButton } from '@/components/ExerciseVideoModal'
import { fetchTodayContext, type TodayContext } from '@/app/dashboard/fitness/fitness-actions'

interface Props {
  initialContext: TodayContext | null
  workoutId: string | null
  activeDayIndex: number | undefined
  todayDayIndex: number
  labels: {
    restDay: string
    startWorkout: string
    recover: string
    logToTrack: string
  }
}

export function TodayWorkoutCard({
  initialContext,
  workoutId,
  activeDayIndex,
  todayDayIndex: initialTodayDayIndex,
  labels,
}: Props) {
  const [context, setContext] = useState<TodayContext | null>(initialContext)
  const [dayIndex, setDayIndex] = useState<number | undefined>(activeDayIndex)
  const [todayDayIndex, setTodayDayIndex] = useState(initialTodayDayIndex)

  // Sync when server re-renders with new props (e.g. after router.refresh on active-day change)
  useEffect(() => {
    setContext(initialContext)
    setDayIndex(activeDayIndex)
    setTodayDayIndex(initialTodayDayIndex)
  }, [initialContext, activeDayIndex, initialTodayDayIndex])

  useEffect(() => {
    if (!workoutId) return

    async function handlePlanChanged(e: Event) {
      const detail = (e as CustomEvent).detail as { dayIndex?: number } | undefined
      // Use day index from event (set-as-today) or current state
      const idx = detail?.dayIndex !== undefined ? detail.dayIndex : dayIndex
      if (detail?.dayIndex !== undefined) {
        setDayIndex(detail.dayIndex)
        setTodayDayIndex(detail.dayIndex)
      }
      const fresh = await fetchTodayContext(workoutId!, idx)
      if (fresh) setContext(fresh)
    }

    window.addEventListener('yunity:plan-changed', handlePlanChanged)
    return () => window.removeEventListener('yunity:plan-changed', handlePlanChanged)
  }, [workoutId, dayIndex])

  if (!context) return null

  const canStart = !context.isRest && todayDayIndex >= 0 && !!workoutId

  return (
    <div className="w-full sm:w-72 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0">
      {/* Card header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10">
        {context.isRest ? (
          <>
            <BedDouble size={13} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-300">{labels.restDay}</span>
            <span className="text-xs text-slate-500 ml-auto">
              {dayIndex !== undefined ? `Day ${dayIndex + 1}` : context.dayName}
            </span>
          </>
        ) : (
          <>
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span className="text-xs font-bold text-slate-300 truncate">
              {dayIndex !== undefined ? `Day ${dayIndex + 1}` : context.dayName} — {context.focus}
            </span>
          </>
        )}
      </div>

      {/* Exercise rows */}
      {!context.isRest && (
        <div className="divide-y divide-white/5">
          {context.exercises.map(ex => (
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
                        <TrendingUp size={9} /> {ex.suggestWeight}{ex.last.unit}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-slate-500">{ex.target}</span>
                )}
                {ex.allTimePR && (
                  <p className="text-[10px] text-amber-400/70 text-right">
                    PR {ex.allTimePR.weight}{ex.allTimePR.unit}×{ex.allTimePR.reps}
                  </p>
                )}
              </div>
            </div>
          ))}

          {context.hasHistory && context.totalVolumeLastSession > 0 && (
            <div className="px-4 py-2 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 uppercase tracking-wide">Last session vol.</span>
              <span className="text-[10px] font-bold text-slate-400">
                {context.totalVolumeLastSession.toLocaleString()} kg
              </span>
            </div>
          )}

          {!context.hasHistory && (
            <div className="px-4 py-2 text-center">
              <p className="text-[10px] text-slate-500">{labels.logToTrack}</p>
            </div>
          )}
        </div>
      )}

      {/* Start Today's Workout CTA */}
      {canStart ? (
        <Link
          href={`/dashboard/fitness/workout/${workoutId}/log/${todayDayIndex}`}
          className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-400 transition-colors px-4 py-2.5 text-sm font-bold text-white"
        >
          <Play size={13} fill="white" /> {labels.startWorkout}
        </Link>
      ) : context.isRest ? (
        <div className="px-4 py-3 text-center">
          <p className="text-xs text-slate-500">{labels.recover}</p>
        </div>
      ) : null}
    </div>
  )
}
