'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Play, ChevronRight, ChevronLeft, Dumbbell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type WorkoutDay = {
  day: string
  focus: string
  exercises: any[]
}

type Workout = {
  id: string
  name: string
  created_at: string
  plan: {
    split_name: string
    days: WorkoutDay[]
  }
}

type Step = 'idle' | 'pick-plan' | 'pick-day'

export function StartWorkoutPicker({ workouts }: { workouts: Workout[] }) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('idle')
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)

  if (workouts.length === 0) return null

  function selectPlan(workout: Workout) {
    setSelectedWorkout(workout)
    setStep('pick-day')
  }

  function startDay(dayIdx: number) {
    if (!selectedWorkout) return
    router.push(`/dashboard/fitness/workout/${selectedWorkout.id}/log/${dayIdx}`)
  }

  if (step === 'idle') {
    return (
      <Button
        onClick={() => setStep('pick-plan')}
        className="gap-2 bg-slate-900 hover:bg-slate-700 text-white px-6 h-11 text-sm font-bold"
      >
        <Play size={14} fill="white" /> Start Workout
      </Button>
    )
  }

  if (step === 'pick-plan') {
    return (
      <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStep('idle')}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 font-medium"
          >
            <ChevronLeft size={16} /> Back
          </button>
          <p className="text-sm font-bold text-slate-700">Choose a plan</p>
        </div>
        <div className="grid gap-2">
          {workouts.map(workout => (
            <button
              key={workout.id}
              onClick={() => selectPlan(workout)}
              className="w-full text-left group"
            >
              <Card className="border-slate-200 transition-all hover:border-slate-400 hover:shadow-sm cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 group-hover:text-slate-700">
                      {workout.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {workout.plan?.split_name} · {new Date(workout.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-all group-hover:translate-x-0.5" />
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (step === 'pick-day' && selectedWorkout) {
    const days = selectedWorkout.plan?.days ?? []
    return (
      <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStep('pick-plan')}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 font-medium"
          >
            <ChevronLeft size={16} /> Back
          </button>
          <p className="text-sm font-bold text-slate-700">
            {selectedWorkout.name} — Pick a day
          </p>
        </div>
        <div className="grid gap-2">
          {days.map((day, idx) => {
            const isRecovery = !day.exercises || day.exercises.length === 0
            return (
              <button
                key={idx}
                onClick={() => !isRecovery && startDay(idx)}
                disabled={isRecovery}
                className={`w-full text-left group ${isRecovery ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <Card className={`border-slate-200 transition-all ${!isRecovery ? 'hover:border-slate-400 hover:shadow-sm cursor-pointer' : ''}`}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-md border ${!isRecovery ? 'bg-slate-100 group-hover:bg-slate-900 transition-colors' : 'bg-slate-50'}`}>
                        <Dumbbell size={14} className={!isRecovery ? 'text-slate-700 group-hover:text-white transition-colors' : 'text-slate-400'} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{day.day}</p>
                        <p className="text-xs text-slate-400">{day.focus}</p>
                      </div>
                    </div>
                    {isRecovery ? (
                      <span className="text-xs text-slate-400 font-medium">Rest</span>
                    ) : (
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-all group-hover:translate-x-0.5" />
                    )}
                  </CardContent>
                </Card>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return null
}
