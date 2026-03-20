'use client'

import { useState } from 'react'
import { ChevronLeft, X } from 'lucide-react'
import { EXERCISE_DB, MUSCLE_GROUPS, MUSCLE_COLORS } from '@/data/exercises'

interface Props {
  onSelect: (name: string, rest: string) => void
  onClose: () => void
}

export function PlanExercisePicker({ onSelect, onClose }: Props) {
  const [group, setGroup] = useState<string | null>(null)

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm animate-in slide-in-from-bottom-2 fade-in duration-150">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-1.5">
          {group && (
            <button onClick={() => setGroup(null)} className="text-slate-400 hover:text-slate-700 transition-colors">
              <ChevronLeft size={15} />
            </button>
          )}
          <span className="text-xs font-bold text-slate-700">
            {group ?? 'Browse by muscle group'}
          </span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
          <X size={14} />
        </button>
      </div>

      {/* Muscle group grid */}
      {!group && (
        <div className="grid grid-cols-2 gap-2 p-3">
          {MUSCLE_GROUPS.map(g => (
            <button
              key={g}
              onClick={() => setGroup(g)}
              className={`rounded-lg border px-3 py-2 text-sm font-semibold text-left transition-colors hover:opacity-90 ${MUSCLE_COLORS[g]}`}
            >
              {g}
              <span className="block text-[10px] font-normal opacity-60 mt-0.5">
                {EXERCISE_DB[g].length} exercises
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Exercise list */}
      {group && (
        <div className="max-h-56 overflow-y-auto divide-y divide-slate-50">
          {(EXERCISE_DB[group] ?? []).map(ex => (
            <button
              key={ex.name}
              onClick={() => onSelect(ex.name, ex.rest)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-slate-50 transition-colors"
            >
              <span className="text-sm font-medium text-slate-800">{ex.name}</span>
              <span className="text-[10px] text-slate-400 shrink-0 ml-2">Rest {ex.rest}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
