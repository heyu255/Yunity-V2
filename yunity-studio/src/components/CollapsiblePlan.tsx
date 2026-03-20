'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp, Dumbbell, Wand2, BedDouble, CalendarCheck, Pencil, Loader2, Check, X, Plus } from 'lucide-react'
import WorkoutGenerator from '@/components/WorkoutGenerator'
import { refineDayPlan, removeDayFromPlan, addDayToPlan } from '@/app/dashboard/ai-actions'
import { toast } from 'sonner'

interface CollapsiblePlanProps {
  isPremium: boolean
  goal: string
  initialPlan: any
  initialPlanName: string | null
  workoutId: string | null
}

const Textarea = ({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={`w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none ${props.className ?? ''}`}
  />
)

export function CollapsiblePlan({ isPremium, goal, initialPlan, initialPlanName, workoutId }: CollapsiblePlanProps) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [showGenerator, setShowGenerator] = useState(false)
  const [localDays, setLocalDays] = useState<any[]>(initialPlan?.days ?? [])
  const [activeDayIdx, setActiveDayIdx] = useState<number | null>(null)

  // Per-day state
  const [customizeOpenIdx, setCustomizeOpenIdx] = useState<number | null>(null)
  const [customizeTexts, setCustomizeTexts] = useState<Record<number, string>>({})
  const [refiningIdx, setRefiningIdx] = useState<number | null>(null)
  const [confirmRemoveIdx, setConfirmRemoveIdx] = useState<number | null>(null)
  const [removingIdx, setRemovingIdx] = useState<number | null>(null)

  // Add day panel
  const [showAddDay, setShowAddDay] = useState(false)
  const [addDayFocus, setAddDayFocus] = useState('')
  const [addingDay, setAddingDay] = useState(false)

  const hasplan = !!initialPlan

  // Sync localDays when a new plan is saved and props update
  useEffect(() => {
    setLocalDays(initialPlan?.days ?? [])
  }, [initialPlan])

  useEffect(() => {
    if (!workoutId) return
    const match = document.cookie.match(/yunity_active_day=([^;]+)/)
    if (match) {
      const [cId, cIdx] = match[1].split(':')
      if (cId === workoutId) {
        const parsed = parseInt(cIdx)
        if (!isNaN(parsed)) setActiveDayIdx(parsed)
      }
    }
  }, [workoutId])

  function startDay(dayIdx: number) {
    if (!workoutId) return
    router.push(`/dashboard/fitness/workout/${workoutId}/log/${dayIdx}`)
  }

  function handleSetActiveDay(idx: number) {
    if (!workoutId) return
    setActiveDayIdx(idx)
    document.cookie = `yunity_active_day=${workoutId}:${idx}; path=/; max-age=${60 * 60 * 24 * 30}`
    router.refresh()
    toast.success(`Day ${idx + 1} set as today`)
  }

  async function handleRefineDay(idx: number) {
    const text = customizeTexts[idx]?.trim()
    if (!text || !workoutId) return
    setRefiningIdx(idx)
    try {
      const updatedDay = await refineDayPlan(workoutId, idx, text)
      if (updatedDay) {
        setLocalDays(prev => prev.map((d, i) => i === idx ? updatedDay : d))
        setCustomizeTexts(prev => ({ ...prev, [idx]: '' }))
        setCustomizeOpenIdx(null)
        toast.success(`Day ${idx + 1} updated!`)
      }
    } catch {
      toast.error('Failed to update. Please try again.')
    } finally {
      setRefiningIdx(null)
    }
  }

  async function handleRemoveDay(idx: number) {
    if (!workoutId) return
    setRemovingIdx(idx)
    try {
      await removeDayFromPlan(workoutId, idx)
      setLocalDays(prev => prev.filter((_, i) => i !== idx))
      setConfirmRemoveIdx(null)
      // Clear active day if it was the removed one
      if (activeDayIdx === idx) {
        setActiveDayIdx(null)
        document.cookie = `yunity_active_day=; path=/; max-age=0`
      } else if (activeDayIdx !== null && activeDayIdx > idx) {
        // Shift active index down
        const newIdx = activeDayIdx - 1
        setActiveDayIdx(newIdx)
        document.cookie = `yunity_active_day=${workoutId}:${newIdx}; path=/; max-age=${60 * 60 * 24 * 30}`
      }
      toast.success('Day removed')
    } catch {
      toast.error('Failed to remove day.')
    } finally {
      setRemovingIdx(null)
    }
  }

  async function handleAddDay() {
    const focus = addDayFocus.trim()
    if (!focus || !workoutId) return
    setAddingDay(true)
    try {
      const newDay = await addDayToPlan(workoutId, focus)
      if (newDay) {
        setLocalDays(prev => [...prev, newDay])
        setAddDayFocus('')
        setShowAddDay(false)
        toast.success(`New day added: ${focus}`)
      }
    } catch {
      toast.error('Failed to add day.')
    } finally {
      setAddingDay(false)
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      {/* Header */}
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
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-1">Active Plan</p>
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

      {expanded && (
        <div className="border-t border-slate-100 animate-in slide-in-from-top-1 fade-in duration-200">

          {!hasplan && (
            <div className="p-5">
              <WorkoutGenerator isPremium={isPremium} goal={goal} initialPlan={null} initialPlanName={null} />
            </div>
          )}

          {hasplan && (
            <>
              <div className="p-4 space-y-2">
                {localDays.map((day, idx) => {
                  const isRest = !day.exercises || day.exercises.length === 0
                  const isActive = activeDayIdx === idx
                  const exercises: any[] = day.exercises ?? []
                  const preview = exercises.slice(0, 4)
                  const overflow = exercises.length - preview.length
                  const isCustomizeOpen = customizeOpenIdx === idx
                  const isRefining = refiningIdx === idx
                  const isConfirmingRemove = confirmRemoveIdx === idx
                  const isRemoving = removingIdx === idx

                  return (
                    <div
                      key={idx}
                      className={`rounded-xl border overflow-hidden transition-all ${
                        isRest ? 'border-slate-100 bg-slate-50 opacity-60'
                        : isActive ? 'border-emerald-200 bg-white'
                        : 'border-slate-200 bg-white'
                      }`}
                    >
                      {/* Day header */}
                      <div className={`flex items-center justify-between px-4 py-3 gap-3 ${isActive ? 'bg-emerald-50' : 'bg-slate-50/60'}`}>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`flex h-7 w-7 items-center justify-center rounded-lg shrink-0 text-[10px] font-black ${
                            isRest ? 'bg-slate-200 text-slate-400'
                            : isActive ? 'bg-emerald-500 text-white'
                            : 'bg-slate-200 text-slate-600'
                          }`}>
                            {isRest ? <BedDouble size={13} /> : `D${idx + 1}`}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-sm font-bold ${isActive ? 'text-emerald-900' : 'text-slate-800'}`}>
                                {day.focus || day.day}
                              </span>
                              {isActive && (
                                <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-100 border border-emerald-200 rounded-full px-1.5 py-0.5">
                                  Today
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400">Day {idx + 1}{isRest ? ' · Rest' : ''}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Set as Today */}
                          {!isRest && !isActive && (
                            <button
                              onClick={() => handleSetActiveDay(idx)}
                              className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-emerald-600 transition-colors"
                              title="Set as today's workout"
                            >
                              <CalendarCheck size={13} /> Set Today
                            </button>
                          )}
                          {isActive && <Check size={15} className="text-emerald-500" />}

                          {/* Remove button */}
                          {!isConfirmingRemove ? (
                            <button
                              onClick={() => setConfirmRemoveIdx(idx)}
                              className="text-slate-300 hover:text-red-400 transition-colors"
                              title="Remove day"
                            >
                              <X size={14} />
                            </button>
                          ) : (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-red-500 font-semibold">Remove?</span>
                              <button
                                onClick={() => handleRemoveDay(idx)}
                                disabled={isRemoving}
                                className="text-[10px] font-bold text-white bg-red-500 hover:bg-red-600 rounded px-1.5 py-0.5 transition-colors"
                              >
                                {isRemoving ? '...' : 'Yes'}
                              </button>
                              <button
                                onClick={() => setConfirmRemoveIdx(null)}
                                className="text-[10px] font-bold text-slate-500 hover:text-slate-700 transition-colors"
                              >
                                No
                              </button>
                            </div>
                          )}
                        </div>
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
                            <p className="text-xs text-slate-400 pl-3">+{overflow} more</p>
                          )}

                          <button
                            onClick={() => startDay(idx)}
                            className={`mt-2 w-full rounded-lg py-2 text-xs font-bold transition-colors ${
                              isActive
                                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            {isActive ? "Start Today's Workout" : 'Start This Workout'}
                          </button>

                          {/* Customize toggle */}
                          <button
                            onClick={() => setCustomizeOpenIdx(isCustomizeOpen ? null : idx)}
                            className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-violet-600 transition-colors mt-1"
                          >
                            <Pencil size={11} />
                            {isCustomizeOpen ? 'Cancel' : 'Customize this day'}
                          </button>

                          {isCustomizeOpen && (
                            <div className="mt-2 space-y-2 animate-in fade-in duration-150">
                              <Textarea
                                rows={2}
                                placeholder="e.g. Remove leg press, add walking lunges. No machines."
                                value={customizeTexts[idx] ?? ''}
                                onChange={e => setCustomizeTexts(prev => ({ ...prev, [idx]: e.target.value }))}
                                disabled={isRefining}
                                className="text-xs"
                              />
                              <button
                                onClick={() => handleRefineDay(idx)}
                                disabled={isRefining || !customizeTexts[idx]?.trim()}
                                className="flex items-center gap-1.5 text-xs font-bold bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white rounded-lg px-3 py-1.5 transition-colors"
                              >
                                {isRefining
                                  ? <><Loader2 size={12} className="animate-spin" /> Updating...</>
                                  : <><Wand2 size={12} /> Update Day</>
                                }
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Add Day */}
                {!showAddDay ? (
                  <button
                    onClick={() => setShowAddDay(true)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 py-3 text-xs font-semibold text-slate-400 hover:text-emerald-600 transition-all"
                  >
                    <Plus size={14} /> Add Training Day
                  </button>
                ) : (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 space-y-2 animate-in fade-in duration-150">
                    <p className="text-xs font-bold text-emerald-800">What's the focus for this day?</p>
                    <input
                      type="text"
                      placeholder="e.g. Upper Body, Core & Abs, Active Recovery..."
                      value={addDayFocus}
                      onChange={e => setAddDayFocus(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleAddDay() }}
                      disabled={addingDay}
                      className="w-full rounded-md border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddDay}
                        disabled={addingDay || !addDayFocus.trim()}
                        className="flex items-center gap-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white rounded-lg px-3 py-1.5 transition-colors"
                      >
                        {addingDay
                          ? <><Loader2 size={12} className="animate-spin" /> Generating...</>
                          : <><Wand2 size={12} /> Generate Day</>
                        }
                      </button>
                      <button
                        onClick={() => { setShowAddDay(false); setAddDayFocus('') }}
                        className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors px-2"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Regenerate plan toggle */}
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
