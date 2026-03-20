'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp, Wand2, BedDouble, CalendarCheck, Pencil, Loader2, Check, X, Plus, Edit2, Save } from 'lucide-react'
import WorkoutGenerator from '@/components/WorkoutGenerator'
import { PlanExercisePicker } from '@/components/PlanExercisePicker'
import { refineDayPlan, removeDayFromPlan, addDayToPlan, updateWorkoutDay } from '@/app/dashboard/ai-actions'
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

const SmallInput = ({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent ${props.className ?? ''}`}
  />
)

export function CollapsiblePlan({ isPremium, goal, initialPlan, initialPlanName, workoutId }: CollapsiblePlanProps) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [showGenerator, setShowGenerator] = useState(false)
  const [localDays, setLocalDays] = useState<any[]>(initialPlan?.days ?? [])
  const [activeDayIdx, setActiveDayIdx] = useState<number | null>(null)

  // Per-day AI customize state
  const [customizeOpenIdx, setCustomizeOpenIdx] = useState<number | null>(null)
  const [customizeTexts, setCustomizeTexts] = useState<Record<number, string>>({})
  const [refiningIdx, setRefiningIdx] = useState<number | null>(null)
  const [confirmRemoveIdx, setConfirmRemoveIdx] = useState<number | null>(null)
  const [removingIdx, setRemovingIdx] = useState<number | null>(null)

  // Manual exercise edit state
  const [editModeIdx, setEditModeIdx] = useState<number | null>(null)
  const [editExercises, setEditExercises] = useState<any[]>([])
  const [savingEdit, setSavingEdit] = useState(false)
  const [newEx, setNewEx] = useState({ name: '', sets: '3', reps: '10', rest: '60s' })
  const [showExPicker, setShowExPicker] = useState(false)

  // Add day panel
  const [showAddDay, setShowAddDay] = useState(false)
  const [addDayFocus, setAddDayFocus] = useState('')
  const [addingDay, setAddingDay] = useState(false)

  const hasplan = !!initialPlan

  // Sync localDays only when a new plan is saved (workoutId changes), not on day-level edits
  useEffect(() => {
    setLocalDays(initialPlan?.days ?? [])
  }, [workoutId])

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

  function notifyPlanChanged(dayIdx?: number) {
    const resolved = dayIdx !== undefined ? dayIdx : activeDayIdx
    window.dispatchEvent(new CustomEvent('yunity:plan-changed', {
      detail: resolved !== null ? { dayIndex: resolved } : {},
    }))
  }

  function handleSetActiveDay(idx: number) {
    if (!workoutId) return
    setActiveDayIdx(idx)
    document.cookie = `yunity_active_day=${workoutId}:${idx}; path=/; max-age=${60 * 60 * 24 * 30}`
    notifyPlanChanged(idx)
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
        notifyPlanChanged()
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
      if (activeDayIdx === idx) {
        setActiveDayIdx(null)
        document.cookie = `yunity_active_day=; path=/; max-age=0`
      } else if (activeDayIdx !== null && activeDayIdx > idx) {
        const newIdx = activeDayIdx - 1
        setActiveDayIdx(newIdx)
        document.cookie = `yunity_active_day=${workoutId}:${newIdx}; path=/; max-age=${60 * 60 * 24 * 30}`
      }
      // Adjust editModeIdx if a day before/at it was removed
      if (editModeIdx !== null) {
        if (editModeIdx === idx) cancelEditMode()
        else if (editModeIdx > idx) setEditModeIdx(editModeIdx - 1)
      }
      toast.success('Day removed')
      notifyPlanChanged()
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
        notifyPlanChanged()
      }
    } catch {
      toast.error('Failed to add day.')
    } finally {
      setAddingDay(false)
    }
  }

  // Manual edit mode
  function openEditMode(idx: number) {
    setEditModeIdx(idx)
    setEditExercises(localDays[idx]?.exercises?.map((ex: any) => ({ ...ex })) ?? [])
    setNewEx({ name: '', sets: '3', reps: '10', rest: '60s' })
    setShowExPicker(false)
    setCustomizeOpenIdx(null)
  }

  function cancelEditMode() {
    setEditModeIdx(null)
    setEditExercises([])
    setNewEx({ name: '', sets: '3', reps: '10', rest: '60s' })
    setShowExPicker(false)
  }

  function addNewExercise() {
    if (!newEx.name.trim()) return
    setEditExercises(prev => [...prev, {
      name: newEx.name.trim(),
      sets: parseInt(newEx.sets) || 3,
      reps: newEx.reps || '10',
      rest: newEx.rest || '60s',
      tip: '',
    }])
    setNewEx({ name: '', sets: '3', reps: '10', rest: '60s' })
    setShowExPicker(false)
  }

  function removeEditExercise(exIdx: number) {
    setEditExercises(prev => prev.filter((_, i) => i !== exIdx))
  }

  async function handleSaveManualEdit(idx: number) {
    if (!workoutId) return
    setSavingEdit(true)
    try {
      const updatedDay = await updateWorkoutDay(workoutId, idx, editExercises)
      if (updatedDay) {
        setLocalDays(prev => prev.map((d, i) => i === idx ? updatedDay : d))
        cancelEditMode()
        toast.success('Exercises saved!')
        notifyPlanChanged()
      }
    } catch {
      toast.error('Failed to save changes.')
    } finally {
      setSavingEdit(false)
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
                  const isCustomizeOpen = customizeOpenIdx === idx
                  const isRefining = refiningIdx === idx
                  const isConfirmingRemove = confirmRemoveIdx === idx
                  const isRemoving = removingIdx === idx
                  const isInEditMode = editModeIdx === idx

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

                          {/* Remove day button */}
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

                      {/* Exercise section */}
                      {!isRest && (
                        <div className="px-4 py-2.5 space-y-1.5">

                          {/* ── Manual edit mode ── */}
                          {isInEditMode ? (
                            <div className="space-y-2 animate-in fade-in duration-150">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Editing exercises</p>

                              {/* Existing exercises */}
                              {editExercises.map((ex: any, exIdx: number) => (
                                <div key={exIdx} className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-slate-800 truncate">{ex.name}</p>
                                    <p className="text-[11px] text-slate-400">{ex.sets} sets × {ex.reps} · {ex.rest}</p>
                                  </div>
                                  <button
                                    onClick={() => removeEditExercise(exIdx)}
                                    className="text-slate-300 hover:text-red-400 transition-colors shrink-0"
                                    title="Remove exercise"
                                  >
                                    <X size={13} />
                                  </button>
                                </div>
                              ))}

                              {editExercises.length === 0 && (
                                <p className="text-xs text-slate-400 text-center py-2">No exercises — add one below</p>
                              )}

                              {/* Add exercise form */}
                              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/50 p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Add exercise</p>
                                  <button
                                    onClick={() => setShowExPicker(v => !v)}
                                    className="text-[10px] font-semibold text-slate-400 hover:text-slate-700 transition-colors"
                                  >
                                    {showExPicker ? 'Close browser' : 'Browse exercises'}
                                  </button>
                                </div>

                                {showExPicker && (
                                  <PlanExercisePicker
                                    onSelect={(name, rest) => {
                                      setNewEx(prev => ({ ...prev, name, rest }))
                                      setShowExPicker(false)
                                    }}
                                    onClose={() => setShowExPicker(false)}
                                  />
                                )}

                                <SmallInput
                                  placeholder="Exercise name"
                                  value={newEx.name}
                                  onChange={e => setNewEx(prev => ({ ...prev, name: e.target.value }))}
                                  onKeyDown={e => { if (e.key === 'Enter') addNewExercise() }}
                                  className="w-full"
                                />
                                <div className="flex gap-2">
                                  <SmallInput
                                    placeholder="Sets"
                                    value={newEx.sets}
                                    onChange={e => setNewEx(prev => ({ ...prev, sets: e.target.value }))}
                                    className="w-16"
                                  />
                                  <SmallInput
                                    placeholder="Reps"
                                    value={newEx.reps}
                                    onChange={e => setNewEx(prev => ({ ...prev, reps: e.target.value }))}
                                    className="w-20"
                                  />
                                  <SmallInput
                                    placeholder="Rest"
                                    value={newEx.rest}
                                    onChange={e => setNewEx(prev => ({ ...prev, rest: e.target.value }))}
                                    className="w-20"
                                  />
                                  <button
                                    onClick={addNewExercise}
                                    disabled={!newEx.name.trim()}
                                    className="flex items-center gap-1 text-xs font-bold bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white rounded-md px-2.5 py-1.5 transition-colors shrink-0"
                                  >
                                    <Plus size={12} /> Add
                                  </button>
                                </div>
                              </div>

                              {/* Save / Cancel */}
                              <div className="flex gap-2 pt-1">
                                <button
                                  onClick={() => handleSaveManualEdit(idx)}
                                  disabled={savingEdit}
                                  className="flex items-center gap-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white rounded-lg px-3 py-1.5 transition-colors"
                                >
                                  {savingEdit ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                                  {savingEdit ? 'Saving...' : 'Save changes'}
                                </button>
                                <button
                                  onClick={cancelEditMode}
                                  className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors px-2"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* ── Normal view ── */
                            <>
                              {exercises.slice(0, 4).map((ex: any, i: number) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                                  <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                                  <span className="truncate">{ex.name}</span>
                                  <span className="text-slate-400 shrink-0">{ex.sets}×{ex.reps}</span>
                                </div>
                              ))}
                              {exercises.length > 4 && (
                                <p className="text-xs text-slate-400 pl-3">+{exercises.length - 4} more</p>
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

                              {/* Action buttons row */}
                              <div className="flex items-center gap-3 mt-1">
                                {/* AI Customize */}
                                <button
                                  onClick={() => {
                                    setCustomizeOpenIdx(isCustomizeOpen ? null : idx)
                                    cancelEditMode()
                                  }}
                                  className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-violet-600 transition-colors"
                                >
                                  <Pencil size={11} />
                                  {isCustomizeOpen ? 'Cancel AI edit' : 'AI customize'}
                                </button>

                                <span className="text-slate-200 text-xs">·</span>

                                {/* Manual edit */}
                                <button
                                  onClick={() => openEditMode(idx)}
                                  className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-700 transition-colors"
                                >
                                  <Edit2 size={11} />
                                  Edit exercises
                                </button>
                              </div>

                              {/* AI Customize panel */}
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
                            </>
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
