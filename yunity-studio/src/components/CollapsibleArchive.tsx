'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp, Dumbbell } from 'lucide-react'

interface ArchivedWorkout {
  id: string
  name: string
  created_at: string
  plan: any
}

export function CollapsibleArchive({ workouts }: { workouts: ArchivedWorkout[] }) {
  const [expanded, setExpanded] = useState(false)

  if (workouts.length === 0) return null

  return (
    <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Dumbbell size={15} className="text-slate-400 shrink-0" />
          <div className="text-left">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-1">
              Plan Archive
            </p>
            <p className="text-sm font-bold text-slate-900">
              {workouts.length} previous {workouts.length === 1 ? 'plan' : 'plans'}
            </p>
          </div>
        </div>
        <span className="flex items-center gap-1 text-xs font-semibold text-slate-400 shrink-0">
          {expanded ? 'Hide' : 'Show'}
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 p-3 space-y-2 animate-in slide-in-from-top-1 fade-in duration-200">
          {workouts.map((workout) => (
            <Link key={workout.id} href={`/dashboard/fitness/workout/${workout.id}`} className="group block">
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 transition-all hover:border-slate-200 hover:bg-white hover:shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200 shrink-0 transition-colors group-hover:bg-slate-900">
                    <Dumbbell size={13} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate text-sm">{workout.name}</p>
                    <p className="text-xs text-slate-400">
                      {workout.plan?.split_name ? `${workout.plan.split_name} · ` : ''}
                      {new Date(workout.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 group-hover:text-slate-600 shrink-0 ml-3 transition-colors">View →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
