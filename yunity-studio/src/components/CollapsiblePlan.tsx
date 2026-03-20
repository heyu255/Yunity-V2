'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp, Dumbbell, Wand2, BedDouble } from 'lucide-react'
import WorkoutGenerator from '@/components/WorkoutGenerator'

interface CollapsiblePlanProps {
  isPremium: boolean
  goal: string
  initialPlan: any
  initialPlanName: string | null
  workoutId: string | null
}

export function CollapsiblePlan({ isPremium, goal, initialPlan, initialPlanName, workoutId }: CollapsiblePlanProps) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [showGenerator, setShowGenerator] = useState(false)

  const hasplan = !!initialPlan
  const days: any[] = initialPlan?.days ?? []

  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const todayName = DAY_NAMES[new Date().getDay()]

  function startDay(dayIdx: number) {
    if (!workoutId) return
    router.push(`/dashboard/fitness/workout/${workoutId}/log/${dayIdx}`)
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      {/* Header — simple, mobile-safe */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <div className="text-left min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-1">
              Active Plan
            </p>
            <p className="text-sm font-bold text-slate-900 truncate">
              {initialPlanName ?? (hasplan ? 'My Workout Plan' : 'No plan yet — tap to create')}
            </p>
          </div>
        </div>
        <span className="flex items-center gap-1 text-xs font-semibold text-slate-400 shrink-0">
          {expanded ? 'Hide' : 'View Days'}
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t border-slate-100 animate-in slide-in-from-top-1 fade-in duration-200">

          {/* No plan yet → show generator directly */}
          {!hasplan && (
            <div className="p-5">
              <WorkoutGenerator isPremium={isPremium} goal={goal} initialPlan={null} initialPlanName={null} />
            </div>
          )}

          {/* Has plan → show day picker */}
          {hasplan && (
            <>
              <div className="p-4 space-y-2">
                {days.map((day, idx) => {
                  const isRest = !day.exercises || day.exercises.length === 0
                  const isToday = day.day === todayName
                  const exercises: any[] = day.exercises ?? []
                  const preview = exercises.slice(0, 4)
                  const overflow = exercises.length - preview.length

                  return (
                    <div
                      key={idx}
                      className={`rounded-xl border overflow-hidden transition-all ${
                        isRest
                          ? 'border-slate-100 bg-slate-50 opacity-50'
                          : isToday
                          ? 'border-emerald-200 bg-white'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      {/* Day header */}
                      <div className={`flex items-center justify-between px-4 py-3 gap-3 ${
                        isToday ? 'bg-emerald-50' : 'bg-slate-50/60'
                      }`}>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`flex h-7 w-7 items-center justify-center rounded-lg shrink-0 ${
                            isRest ? 'bg-slate-200' : isToday ? 'bg-emerald-500' : 'bg-slate-200'
                          }`}>
                            {isRest
                              ? <BedDouble size={13} className="text-slate-400" />
                              : <Dumbbell size={13} className={isToday ? 'text-white' : 'text-slate-500'} />
                            }
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-sm font-bold ${isToday ? 'text-emerald-900' : 'text-slate-800'}`}>
                                {day.day}
                              </span>
                              {isToday && (
                                <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-100 border border-emerald-200 rounded-full px-1.5 py-0.5">
                                  Today
                                </span>
                              )}
                            </div>
                            <p className={`text-xs font-medium ${isToday ? 'text-emerald-700' : 'text-slate-500'}`}>
                              {day.focus}
                            </p>
                          </div>
                        </div>
                        {isRest && (
                          <span className="text-xs text-slate-400 shrink-0">Rest day</span>
                        )}
                      </div>

                      {/* Exercise list */}
                      {!isRest && (
                        <div className="px-4 py-2.5 space-y-1.5">
                          {preview.map((ex: any, i: number) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                              <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                              <span className="truncate">{ex.name}</span>
                              <span className="text-slate-400 shrink-0">{ex.sets}×{ex.reps}</span>
                            </div>
                          ))}
                          {overflow > 0 && (
                            <p className="text-xs text-slate-400 pl-3">+{overflow} more exercises</p>
                          )}

                          {/* CTA */}
                          <button
                            onClick={() => startDay(idx)}
                            className={`mt-2 w-full rounded-lg py-2 text-xs font-bold transition-colors ${
                              isToday
                                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            {isToday ? "Start Today's Workout" : "Switch to This Day's Workout"}
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Change / regenerate plan toggle */}
              <div className="px-4 pb-4 space-y-3">
                <button
                  onClick={() => setShowGenerator(v => !v)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <Wand2 size={12} />
                  {showGenerator ? 'Hide plan editor' : 'Change or regenerate plan'}
                  {showGenerator ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                </button>

                {showGenerator && (
                  <div className="animate-in fade-in duration-200">
                    <WorkoutGenerator
                      isPremium={isPremium}
                      goal={goal}
                      initialPlan={initialPlan}
                      initialPlanName={initialPlanName}
                      editorMode={true}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  )
}
