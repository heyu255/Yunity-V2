'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { logWorkout, type ExerciseLog } from '@/app/dashboard/fitness/workout/actions'
import { toast } from 'sonner'

type Exercise = {
  name: string
  sets: number
  reps: string
  rest: string
  tip?: string
  instructions?: string
}

type SetState = { reps: string; weight: string; completed: boolean }
type ExerciseState = { name: string; sets: SetState[] }

function initLogs(exercises: Exercise[]): ExerciseState[] {
  return exercises.map(ex => ({
    name: ex.name,
    sets: Array.from({ length: ex.sets }, () => ({ reps: '', weight: '', completed: false })),
  }))
}

export function WorkoutLogger({
  workoutId,
  dayIndex,
  dayName,
  exercises,
}: {
  workoutId: string
  dayIndex: number
  dayName: string
  exercises: Exercise[]
}) {
  const router = useRouter()
  const [logs, setLogs] = useState<ExerciseState[]>(() => initLogs(exercises))
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg')
  const [submitting, setSubmitting] = useState(false)

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
  }

  async function handleFinish() {
    setSubmitting(true)
    try {
      const payload: ExerciseLog[] = logs.map(ex => ({
        name: ex.name,
        sets: ex.sets.map((s, i) => ({
          set_number: i + 1,
          reps: s.reps ? parseInt(s.reps) : null,
          weight: s.weight ? parseFloat(s.weight) : null,
          completed: s.completed,
        })),
      }))
      await logWorkout(workoutId, dayIndex, dayName, payload, unit)
      router.push(`/dashboard/fitness/workout/${workoutId}`)
    } catch {
      toast.error('Failed to save workout log. Please try again.')
      setSubmitting(false)
    }
  }

  const completedSets = logs.flatMap(ex => ex.sets).filter(s => s.completed).length
  const totalSets = logs.flatMap(ex => ex.sets).length

  return (
    <div className="space-y-6">
      {/* Unit toggle + progress */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-500 font-medium">Weight unit:</span>
        <div className="flex rounded-lg border border-slate-200 overflow-hidden">
          <button
            onClick={() => toggleUnit('kg')}
            className={`px-3 py-1.5 text-sm font-semibold transition-colors ${
              unit === 'kg' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            kg
          </button>
          <button
            onClick={() => toggleUnit('lbs')}
            className={`px-3 py-1.5 text-sm font-semibold transition-colors ${
              unit === 'lbs' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            lbs
          </button>
        </div>
        <span className="ml-auto text-sm font-semibold text-slate-500">
          {completedSets}/{totalSets} sets done
        </span>
      </div>

      {/* Exercises */}
      {logs.map((ex, exIdx) => {
        const exercise = exercises[exIdx]
        return (
          <Card key={exIdx} className="overflow-hidden border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 py-4 border-b">
              <CardTitle className="text-base font-bold text-slate-900">{ex.name}</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Target: {exercise.sets} × {exercise.reps} · Rest {exercise.rest}
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {/* Column headers */}
                <div className="grid grid-cols-[2.5rem_1fr_1fr_3rem] gap-3 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <span>Set</span>
                  <span>Weight ({unit})</span>
                  <span>Reps</span>
                  <span />
                </div>
                {ex.sets.map((set, setIdx) => (
                  <div
                    key={setIdx}
                    className={`grid grid-cols-[2.5rem_1fr_1fr_3rem] gap-3 px-4 py-2 items-center transition-colors ${
                      set.completed ? 'bg-green-50' : ''
                    }`}
                  >
                    <span className="text-sm font-bold text-slate-500">{setIdx + 1}</span>
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder="—"
                      value={set.weight}
                      onChange={e => updateSet(exIdx, setIdx, 'weight', e.target.value)}
                      className="h-11 text-sm"
                    />
                    <Input
                      type="number"
                      min="0"
                      placeholder="—"
                      value={set.reps}
                      onChange={e => updateSet(exIdx, setIdx, 'reps', e.target.value)}
                      className="h-11 text-sm"
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
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Finish button */}
      <Button
        onClick={handleFinish}
        disabled={submitting || completedSets === 0}
        className="w-full bg-slate-900 hover:bg-slate-700 text-white h-12 text-base font-bold"
      >
        {submitting ? 'Saving...' : `Finish Workout · ${completedSets}/${totalSets} sets`}
      </Button>
    </div>
  )
}
