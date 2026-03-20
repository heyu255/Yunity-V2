'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Trophy, Plus, X, Sparkles } from 'lucide-react'
import { AddExercisePanel } from '@/components/AddExercisePanel'
import { ExerciseVideoButton } from '@/components/ExerciseVideoModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { logWorkout, type ExerciseLog } from '@/app/dashboard/fitness/workout/actions'
import { RestTimer } from '@/components/RestTimer'
import { toast } from 'sonner'
import type { PR, LastSession } from '@/app/dashboard/fitness/fitness-actions'

type Exercise = {
  name: string
  sets: number
  reps: string
  rest: string
  tip?: string
  instructions?: string
  isCustom?: boolean
}

type SetState = { reps: string; weight: string; completed: boolean; duration: string; distance: string }
type ExerciseState = { name: string; sets: SetState[] }

const CARDIO_PATTERN = /\b(jog|jogging|run|running|walk|walking|cycl|bik(e|ing)|swim|swimming|rowing machine|jump rope|skipping|elliptical|stair|treadmill|cardio|hiit|sprint(ing)?)\b/i
function isCardio(name: string): boolean {
  return CARDIO_PATTERN.test(name)
}

function initLogs(exercises: Exercise[]): ExerciseState[] {
  return exercises.map(ex => ({
    name: ex.name,
    sets: Array.from({ length: ex.sets }, () => ({ reps: '', weight: '', completed: false, duration: '', distance: '' })),
  }))
}

// Infer default rest based on exercise name when plan doesn't specify
function inferRestFromName(name: string): number {
  const n = name.toLowerCase()
  // Big compound movements — 2 min
  if (/squat|deadlift|bench press|barbell row|pull.?up|chin.?up|overhead press|ohp|rdl|hip thrust|leg press/.test(n))
    return 120
  // Medium compounds — 90 s
  if (/dip|lunge|incline|decline|seated row|lat pull|push press|arnold|step.?up/.test(n))
    return 90
  // Isolation / small muscles — 60 s
  return 60
}

function parseRestSeconds(restStr: string, exerciseName = ''): number {
  if (!restStr) return inferRestFromName(exerciseName)
  const minMatch = restStr.match(/(\d+)\s*min/i)
  if (minMatch) return parseInt(minMatch[1]) * 60
  const rangeMatch = restStr.match(/(\d+)\s*-\s*(\d+)/)
  if (rangeMatch) return Math.round((parseInt(rangeMatch[1]) + parseInt(rangeMatch[2])) / 2)
  const numMatch = restStr.match(/(\d+)/)
  if (numMatch) {
    const explicit = parseInt(numMatch[1])
    // If plan gives only the generic 60s fallback, override with name-based inference
    return explicit === 60 ? inferRestFromName(exerciseName) : explicit
  }
  return inferRestFromName(exerciseName)
}

function calcOneRM(weight: number, reps: number): number {
  return Math.round(weight * (1 + reps / 30) * 10) / 10
}

function toUnit(weight: number, from: string, to: string): number {
  if (from === to) return weight
  if (from === 'kg' && to === 'lbs') return Math.round(weight * 2.2046 * 2) / 2
  if (from === 'lbs' && to === 'kg') return Math.round(weight * 0.4536 * 4) / 4
  return weight
}

export function WorkoutLogger({
  workoutId,
  dayIndex,
  dayName,
  exercises,
  previousBests = {},
  lastSessions = {},
  availableExercises = [],
}: {
  workoutId: string
  dayIndex: number
  dayName: string
  exercises: Exercise[]
  previousBests?: Record<string, PR>
  lastSessions?: Record<string, LastSession>
  availableExercises?: Exercise[]
}) {
  const router = useRouter()

  // allExercises grows when user adds custom ones
  const [allExercises, setAllExercises] = useState<Exercise[]>(exercises)
  const [logs, setLogs] = useState<ExerciseState[]>(() => initLogs(exercises))

  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg')
  const [submitting, setSubmitting] = useState(false)
  const [timer, setTimer] = useState<{ seconds: number; exerciseName: string } | null>(null)
  const [newPRs, setNewPRs] = useState<Set<string>>(new Set())

  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('yunity_weight_unit')
    if (saved === 'kg' || saved === 'lbs') setUnit(saved)
  }, [])

  function toggleUnit(u: 'kg' | 'lbs') {
    setUnit(u)
    localStorage.setItem('yunity_weight_unit', u)
  }

  function updateSet(exIdx: number, setIdx: number, field: keyof SetState, value: string | boolean) {
    setLogs(prev =>
      prev.map((ex, i) =>
        i === exIdx
          ? { ...ex, sets: ex.sets.map((s, j) => j === setIdx ? { ...s, [field]: value } : s) }
          : ex
      )
    )

    if (field === 'completed' && value === true) {
      const exName = allExercises[exIdx]?.name ?? logs[exIdx].name

      if (!isCardio(exName)) {
        const currentSet = logs[exIdx].sets[setIdx]
        const weight = parseFloat(currentSet.weight)
        const reps = parseInt(currentSet.reps)

        if (weight > 0 && reps > 0) {
          const oneRM = calcOneRM(weight, reps)
          const exKey = logs[exIdx].name.toLowerCase().trim()
          const prevBest = previousBests[exKey]
          if (!prevBest || oneRM > prevBest.oneRM) {
            setNewPRs(prev => new Set([...prev, exKey]))
          }
        }

        const restSecs = parseRestSeconds(allExercises[exIdx]?.rest ?? '', exName)
        setTimer({ seconds: restSecs, exerciseName: exName })
      }
    }
  }

  function handleAddExercise({ name, sets: numSets, reps, weight, rest }: {
    name: string; sets: number; reps: string; weight: string; rest: string
  }) {
    const custom: Exercise = { name, sets: numSets, reps, rest, isCustom: true }
    setAllExercises(prev => [...prev, custom])
    setLogs(prev => [...prev, {
      name,
      sets: Array.from({ length: numSets }, () => ({ reps: '', weight, completed: false, duration: '', distance: '' })),
    }])
    setShowAddForm(false)
    toast.success(`${name} added`)
  }

  function handleRemoveCustom(exIdx: number) {
    setAllExercises(prev => prev.filter((_, i) => i !== exIdx))
    setLogs(prev => prev.filter((_, i) => i !== exIdx))
  }

  async function handleFinish() {
    setSubmitting(true)
    try {
      const payload: ExerciseLog[] = logs.map(ex => ({
        name: ex.name,
        sets: ex.sets.map((s, i) => isCardio(ex.name)
          ? {
              set_number: i + 1,
              reps: null,
              weight: null,
              completed: s.completed,
              duration_min: s.duration ? parseFloat(s.duration) : null,
              distance: s.distance ? parseFloat(s.distance) : null,
            }
          : {
              set_number: i + 1,
              reps: s.reps ? parseInt(s.reps) : null,
              weight: s.weight ? parseFloat(s.weight) : null,
              completed: s.completed,
            }
        ),
      }))
      await logWorkout(workoutId, dayIndex, dayName, payload, unit)
      router.push('/dashboard/fitness')
    } catch {
      toast.error('Failed to save workout log. Please try again.')
      setSubmitting(false)
    }
  }

  const completedSets = logs.flatMap(ex => ex.sets).filter(s => s.completed).length
  const totalSets = logs.flatMap(ex => ex.sets).length
  const customCount = allExercises.filter(e => e.isCustom).length

  return (
    <div className="space-y-5">
      {timer && (
        <RestTimer
          seconds={timer.seconds}
          exerciseName={timer.exerciseName}
          onDismiss={() => setTimer(null)}
        />
      )}

      {/* Progress header */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Unit:</span>
            <div className="flex rounded-lg border border-slate-200 overflow-hidden">
              <button
                onClick={() => toggleUnit('kg')}
                className={`px-3 py-1 text-xs font-bold transition-colors ${
                  unit === 'kg' ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                kg
              </button>
              <button
                onClick={() => toggleUnit('lbs')}
                className={`px-3 py-1 text-xs font-bold transition-colors ${
                  unit === 'lbs' ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                lbs
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">{completedSets}/{totalSets}</span>
            <span className="text-xs text-slate-400">sets</span>
            {customCount > 0 && (
              <span className="text-[10px] font-bold text-violet-500 bg-violet-50 border border-violet-100 rounded-full px-2 py-0.5">
                +{customCount} extra
              </span>
            )}
          </div>
        </div>
        <div className="h-1.5 bg-slate-100">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
            style={{ width: totalSets > 0 ? `${(completedSets / totalSets) * 100}%` : '0%' }}
          />
        </div>
      </div>

      {/* Exercises */}
      {logs.map((ex, exIdx) => {
        const exercise = allExercises[exIdx]
        const exKey = ex.name.toLowerCase().trim()
        const prevBest = previousBests[exKey]
        const lastSess = lastSessions[exKey]
        const isNewPR = newPRs.has(exKey)
        const isCustom = exercise?.isCustom
        const cardio = isCardio(ex.name)

        return (
          <Card key={exIdx} className={`overflow-hidden shadow-sm ${isCustom ? 'border-violet-200' : 'border-slate-200'}`}>
            <CardHeader className={`py-4 border-b ${isCustom ? 'bg-violet-50/50' : 'bg-slate-50/50'}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-bold text-slate-900">{ex.name}</CardTitle>
                    <ExerciseVideoButton exerciseName={ex.name} />
                    {isCustom && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-violet-500 bg-violet-50 border border-violet-200 rounded-full px-1.5 py-0.5">
                        <Sparkles size={9} /> Custom
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Target: {exercise?.sets} × {exercise?.reps}
                    {!isCustom && exercise?.rest ? ` · Rest ${exercise.rest}` : ''}
                  </p>
                  {exercise?.tip && (
                    <p className="mt-1.5 text-xs italic text-slate-500 border-l-2 border-slate-200 pl-2">
                      💡 {exercise.tip}
                    </p>
                  )}
                </div>
                <div className="flex items-start gap-2 shrink-0">
                  <div className="flex flex-col items-end gap-1">
                    {isNewPR && (
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                        <Trophy size={11} /> New PR!
                      </span>
                    )}
                    {prevBest && !isNewPR && (
                      <span className="text-xs text-slate-400 text-right">
                        PR: {prevBest.weight}{prevBest.unit} × {prevBest.reps}
                        <br />
                        <span className="text-slate-300">~{Math.round(prevBest.oneRM * 10) / 10} 1RM</span>
                      </span>
                    )}
                    {lastSess && (() => {
                      const lastW = toUnit(lastSess.weight, lastSess.unit, unit)
                      const suggestW = toUnit(lastSess.suggestWeight, lastSess.unit, unit)
                      return (
                        <span className="text-xs text-slate-400 text-right">
                          Last: {lastSess.completedSets}×{lastSess.reps} @ {lastW}{unit}
                          <br />
                          <span className="text-emerald-500 font-medium">↑ Try {suggestW}{unit}</span>
                        </span>
                      )
                    })()}
                  </div>
                  {isCustom && (
                    <button
                      onClick={() => handleRemoveCustom(exIdx)}
                      className="text-slate-300 hover:text-red-400 transition-colors mt-0.5"
                      title="Remove exercise"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {cardio ? (
                <div className="divide-y divide-slate-100">
                  <div className="grid grid-cols-[1fr_1fr_3rem] gap-3 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <span>Duration (min)</span>
                    <span>Distance (km)</span>
                    <span />
                  </div>
                  {ex.sets.map((set, setIdx) => (
                    <div
                      key={setIdx}
                      className={`grid grid-cols-[1fr_1fr_3rem] gap-3 px-4 py-2.5 items-center transition-colors ${set.completed ? 'bg-green-50' : ''}`}
                    >
                      <Input
                        type="number" min="0" step="1" placeholder="e.g. 20"
                        value={set.duration}
                        onChange={e => updateSet(exIdx, setIdx, 'duration', e.target.value)}
                        className="h-11 text-sm"
                      />
                      <Input
                        type="number" min="0" step="0.1" placeholder="optional"
                        value={set.distance}
                        onChange={e => updateSet(exIdx, setIdx, 'distance', e.target.value)}
                        className="h-11 text-sm"
                      />
                      <button
                        onClick={() => updateSet(exIdx, setIdx, 'completed', !set.completed)}
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors mx-auto ${
                          set.completed ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 hover:border-slate-500'
                        }`}
                      >
                        {set.completed && <Check size={14} strokeWidth={3} />}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  <div className="grid grid-cols-[2.5rem_1fr_1fr_3rem] gap-3 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <span>Set</span>
                    <span>Weight ({unit})</span>
                    <span>Reps</span>
                    <span />
                  </div>
                  {ex.sets.map((set, setIdx) => {
                    const w = parseFloat(set.weight)
                    const r = parseInt(set.reps)
                    const oneRM = set.completed && w > 0 && r > 0 ? calcOneRM(w, r) : null
                    const suggestW = lastSess ? toUnit(lastSess.suggestWeight, lastSess.unit, unit) : null

                    return (
                      <div key={setIdx}>
                        <div
                          className={`grid grid-cols-[2.5rem_1fr_1fr_3rem] gap-3 px-4 py-2 items-center transition-colors ${
                            set.completed ? 'bg-green-50' : ''
                          }`}
                        >
                          <span className="text-sm font-bold text-slate-500">{setIdx + 1}</span>
                          <Input
                            type="number"
                            min="0"
                            step="0.5"
                            placeholder={suggestW != null ? `e.g. ${suggestW}` : "—"}
                            value={set.weight}
                            onChange={e => updateSet(exIdx, setIdx, 'weight', e.target.value)}
                            className="h-11 text-sm placeholder:text-slate-300 placeholder:italic"
                          />
                          <Input
                            type="number"
                            min="0"
                            placeholder={lastSess ? `e.g. ${lastSess.reps}` : "—"}
                            value={set.reps}
                            onChange={e => updateSet(exIdx, setIdx, 'reps', e.target.value)}
                            className="h-11 text-sm placeholder:text-slate-300 placeholder:italic"
                          />
                          <button
                            onClick={() => updateSet(exIdx, setIdx, 'completed', !set.completed)}
                            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors mx-auto ${
                              set.completed
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-slate-300 hover:border-slate-500'
                            }`}
                          >
                            {set.completed && <Check size={14} strokeWidth={3} />}
                          </button>
                        </div>
                        {oneRM !== null && (
                          <div className="px-4 pb-2 flex items-center gap-2 text-xs bg-green-50 text-slate-400">
                            Est. 1RM: <span className="font-semibold text-slate-600">{oneRM} {unit}</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}

      {/* Add Exercise */}
      {showAddForm ? (
        <AddExercisePanel
          unit={unit}
          availableExercises={availableExercises}
          alreadyAdded={new Set(allExercises.map(e => e.name.toLowerCase()))}
          onAdd={(name, sets, reps, weight, rest) => {
            handleAddExercise({ name, sets: Math.max(1, parseInt(sets) || 3), reps, weight, rest })
          }}
          onClose={() => setShowAddForm(false)}
        />
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full rounded-xl border-2 border-dashed border-slate-300 hover:border-violet-300 hover:bg-violet-50/40 py-3.5 flex items-center justify-center gap-2 text-sm font-semibold text-slate-400 hover:text-violet-600 transition-all"
        >
          <Plus size={16} /> Add Exercise
        </button>
      )}

      <Button
        onClick={handleFinish}
        disabled={submitting || completedSets === 0}
        className="w-full text-base font-bold rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg disabled:opacity-40"
        style={{ height: '52px' }}
      >
        {submitting ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Saving...
          </span>
        ) : completedSets === totalSets && totalSets > 0 ? (
          `🎉 Finish Workout — All ${totalSets} sets done!`
        ) : (
          `Finish Workout · ${completedSets}/${totalSets} sets`
        )}
      </Button>
    </div>
  )
}
