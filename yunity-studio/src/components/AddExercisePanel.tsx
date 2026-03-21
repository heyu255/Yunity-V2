'use client'

import { useState } from 'react'
import { X, ChevronLeft, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { EXERCISE_DB, MUSCLE_GROUPS, MUSCLE_COLORS, MUSCLE_ACTIVE, type ExerciseEntry } from '@/data/exercises'

interface PlanExercise {
  name: string
  sets: number
  reps: string
  rest: string
}

interface Props {
  unit: string
  availableExercises: PlanExercise[]
  alreadyAdded: Set<string>
  onAdd: (name: string, sets: string, reps: string, weight: string, rest: string, type: string) => void
  onClose: () => void
}

const CARDIO_PATTERN = /\b(jog(ging)?|run(ning)?|walk(ing)?|hik(e|ing)|cycl(e|ing)|bik(e|ing)|spin(ning)?|row(ing)?|swim(ming)?|jump\s?rope|skip(ping)?|elliptical|stair(s)?|treadmill|cardio|hiit|sprint(ing)?|assault\s?bike|cross\s?trainer|battle\s?rope|sled\s?push|indoor\s?cycling)\b/i
const TIMED_PATTERN = /\b(plank|side\s?plank|wall\s?sit|dead\s?hang|l.?sit|hollow\s?hold|static\s?hold|isometric|farmer.?hold|farmer\s?carry|hanging\s?hold|bear\s?hold)\b/i
const BODYWEIGHT_PATTERN = /\b(push.?up|pull.?up|chin.?up|burpee|crunch|sit.?up|leg\s?raise|knee\s?raise|mountain\s?climber|box\s?jump|jump\s?squat|flutter\s?kick|v.?up|russian\s?twist|bicycle\s?crunch|reverse\s?crunch|superman|inchworm|bear\s?crawl|hip\s?raise|glute\s?bridge|air\s?squat|jumping\s?jack)\b/i

function detectType(name: string): 'strength' | 'cardio' | 'timed' | 'bodyweight' {
  if (CARDIO_PATTERN.test(name)) return 'cardio'
  if (TIMED_PATTERN.test(name)) return 'timed'
  if (BODYWEIGHT_PATTERN.test(name)) return 'bodyweight'
  return 'strength'
}

export function AddExercisePanel({ unit, availableExercises, alreadyAdded, onAdd, onClose }: Props) {
  const [step, setStep] = useState<'group' | 'exercise' | 'config'>('group')
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [selectedExercise, setSelectedExercise] = useState<{ name: string; rest: string } | null>(null)
  const [sets, setSets] = useState('3')
  const [reps, setReps] = useState('8-12')
  const [weight, setWeight] = useState('')

  // Exercises from the plan that aren't already in the session
  const planExercises = availableExercises.filter(e => !alreadyAdded.has(e.name.toLowerCase()))

  function pickGroup(group: string) {
    setSelectedGroup(group)
    setStep('exercise')
  }

  function pickExercise(ex: { name: string; rest: string }) {
    setSelectedExercise(ex)
    setStep('config')
  }

  function pickPlanExercise(ex: PlanExercise) {
    setSelectedExercise({ name: ex.name, rest: ex.rest })
    setSets(String(ex.sets))
    setReps(ex.reps)
    setStep('config')
  }

  const exType = selectedExercise ? detectType(selectedExercise.name) : 'strength'

  function handleAdd() {
    if (!selectedExercise) return
    onAdd(selectedExercise.name, sets, reps, weight, selectedExercise.rest, exType)
  }

  const exerciseList: ExerciseEntry[] = selectedGroup ? EXERCISE_DB[selectedGroup] ?? [] : []
  const filteredList = exerciseList.filter(e => !alreadyAdded.has(e.name.toLowerCase()))

  return (
    <div className="rounded-xl border-2 border-violet-200 bg-white overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-violet-100 bg-violet-50/60">
        <div className="flex items-center gap-2">
          {step !== 'group' && (
            <button
              onClick={() => setStep(step === 'config' ? 'exercise' : 'group')}
              className="text-violet-400 hover:text-violet-700 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
          )}
          <span className="text-sm font-bold text-violet-700">
            {step === 'group' && 'Add Exercise'}
            {step === 'exercise' && selectedGroup}
            {step === 'config' && selectedExercise?.name}
          </span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Step 1 — Muscle group picker */}
      {step === 'group' && (
        <div className="p-4 space-y-4">
          {/* From your plan */}
          {planExercises.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">From Your Plan</p>
              <div className="grid grid-cols-1 gap-1.5">
                {planExercises.map(ex => (
                  <button
                    key={ex.name}
                    onClick={() => pickPlanExercise(ex)}
                    className="flex items-center justify-between rounded-lg border border-violet-100 bg-violet-50/50 px-3 py-2 text-left text-sm font-medium text-violet-700 hover:bg-violet-100 transition-colors"
                  >
                    <span>{ex.name}</span>
                    <span className="text-[10px] text-violet-400">{ex.sets}×{ex.reps}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Muscle group grid */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Browse by Muscle Group</p>
            <div className="grid grid-cols-2 gap-2">
              {MUSCLE_GROUPS.map(group => (
                <button
                  key={group}
                  onClick={() => pickGroup(group)}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-semibold text-left transition-colors hover:opacity-90 ${MUSCLE_COLORS[group]}`}
                >
                  {group}
                  <span className="block text-[10px] font-normal opacity-60 mt-0.5">
                    {EXERCISE_DB[group].length} exercises
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2 — Exercise list */}
      {step === 'exercise' && selectedGroup && (
        <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
          {filteredList.length === 0 ? (
            <p className="p-4 text-sm text-slate-400 text-center">All exercises from this group already added.</p>
          ) : (
            filteredList.map(ex => (
              <button
                key={ex.name}
                onClick={() => pickExercise(ex)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm font-medium text-slate-800">{ex.name}</span>
                <span className="text-[10px] text-slate-400 shrink-0 ml-2">Rest {ex.rest}</span>
              </button>
            ))
          )}
        </div>
      )}

      {/* Step 3 — Configure */}
      {step === 'config' && selectedExercise && (
        <div className="p-4 space-y-4">
          {/* Cardio: intervals only */}
          {exType === 'cardio' && (
            <>
              <div className="w-32 space-y-1">
                <label className="text-xs font-semibold text-slate-500">Intervals</label>
                <Input type="number" min="1" max="10" value={sets} onChange={e => setSets(e.target.value)} className="border-violet-200" />
              </div>
              <p className="text-xs text-slate-400 italic">Duration & distance will be logged during the session.</p>
            </>
          )}

          {/* Timed holds: sets only */}
          {exType === 'timed' && (
            <>
              <div className="w-32 space-y-1">
                <label className="text-xs font-semibold text-slate-500">Sets</label>
                <Input type="number" min="1" max="10" value={sets} onChange={e => setSets(e.target.value)} className="border-violet-200" />
              </div>
              <p className="text-xs text-slate-400 italic">Duration in seconds will be logged during the session.</p>
            </>
          )}

          {/* Bodyweight: sets + reps, no weight */}
          {exType === 'bodyweight' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Sets</label>
                <Input type="number" min="1" max="10" value={sets} onChange={e => setSets(e.target.value)} className="border-violet-200" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Reps</label>
                <Input placeholder="e.g. 15" value={reps} onChange={e => setReps(e.target.value)} className="border-violet-200" />
              </div>
            </div>
          )}

          {/* Strength: sets + reps + weight */}
          {exType === 'strength' && (
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Sets</label>
                <Input type="number" min="1" max="10" value={sets} onChange={e => setSets(e.target.value)} className="border-violet-200" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Reps</label>
                <Input placeholder="8-12" value={reps} onChange={e => setReps(e.target.value)} className="border-violet-200" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Weight ({unit})</label>
                <Input type="number" min="0" step="0.5" placeholder="0" value={weight} onChange={e => setWeight(e.target.value)} className="border-violet-200" />
              </div>
            </div>
          )}

          <button
            onClick={handleAdd}
            className="w-full rounded-lg bg-violet-600 hover:bg-violet-700 text-white py-2.5 text-sm font-bold transition-colors flex items-center justify-center gap-2"
          >
            <Check size={14} /> Add to Session
          </button>
        </div>
      )}
    </div>
  )
}
