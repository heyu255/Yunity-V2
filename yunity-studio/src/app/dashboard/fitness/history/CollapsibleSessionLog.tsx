'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

function getFocusAccent(focus: string) {
  const f = (focus ?? '').toLowerCase()
  if (f.includes('chest') || f.includes('push'))
    return { border: 'border-l-indigo-400', badge: 'bg-indigo-50 text-indigo-600 border-indigo-100' }
  if (f.includes('back') || f.includes('pull') || f.includes('row'))
    return { border: 'border-l-emerald-400', badge: 'bg-emerald-50 text-emerald-600 border-emerald-100' }
  if (f.includes('leg') || f.includes('squat') || f.includes('lower'))
    return { border: 'border-l-amber-400', badge: 'bg-amber-50 text-amber-600 border-amber-100' }
  if (f.includes('shoulder') || f.includes('delt'))
    return { border: 'border-l-violet-400', badge: 'bg-violet-50 text-violet-600 border-violet-100' }
  if (f.includes('arm') || f.includes('bicep') || f.includes('tricep'))
    return { border: 'border-l-rose-400', badge: 'bg-rose-50 text-rose-600 border-rose-100' }
  if (f.includes('full') || f.includes('total') || f.includes('hiit'))
    return { border: 'border-l-cyan-400', badge: 'bg-cyan-50 text-cyan-600 border-cyan-100' }
  if (f.includes('core') || f.includes('abs'))
    return { border: 'border-l-orange-400', badge: 'bg-orange-50 text-orange-600 border-orange-100' }
  return { border: 'border-l-slate-300', badge: 'bg-slate-50 text-slate-500 border-slate-100' }
}

function calcVol(exerciseLogs: any[], unit: string) {
  let vol = 0
  for (const ex of exerciseLogs ?? []) {
    for (const set of ex.sets ?? []) {
      if (set.completed && set.weight && set.reps) vol += set.weight * set.reps
    }
  }
  return vol > 0 ? `${vol.toLocaleString()} ${unit}` : null
}

interface LogEntry {
  id: string
  created_at: string
  workout_id: string
  day_index: number
  day_name: string
  exercise_logs: any[]
  unit: string
  workoutName: string
  dayFocus: string
}

function SessionCard({ log }: { log: LogEntry }) {
  const completedSets = (log.exercise_logs ?? []).flatMap((e: any) => e.sets ?? []).filter((s: any) => s.completed).length
  const totalSets = (log.exercise_logs ?? []).flatMap((e: any) => e.sets ?? []).length
  const vol = calcVol(log.exercise_logs, log.unit)
  const accent = getFocusAccent(log.dayFocus ?? '')
  const pct = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0

  return (
    <div className={`rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm border-l-4 ${accent.border}`}>
      <div className="flex items-start justify-between px-4 py-3 gap-3 border-b border-slate-50">
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 text-sm truncate">{log.workoutName}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] font-semibold rounded-full border px-2 py-0.5 ${accent.badge}`}>
              {log.dayFocus}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-slate-800">{pct}%</p>
          <p className="text-[10px] text-slate-400">{completedSets}/{totalSets} sets</p>
          {vol && <p className="text-[10px] text-slate-400">{vol}</p>}
        </div>
      </div>

      <div className="h-0.5 bg-slate-100">
        <div className="h-full bg-emerald-400 transition-all" style={{ width: `${pct}%` }} />
      </div>

      <div className="divide-y divide-slate-50">
        {(log.exercise_logs ?? []).map((ex: any, i: number) => {
          const doneSets = (ex.sets ?? []).filter((s: any) => s.completed)
          const bestSet = doneSets.reduce((best: any, s: any) =>
            !best || (s.weight ?? 0) > (best.weight ?? 0) ? s : best, null)
          const oneRM = bestSet?.weight && bestSet?.reps
            ? Math.round(bestSet.weight * (1 + bestSet.reps / 30) * 10) / 10
            : null
          return (
            <div key={i} className="flex items-center justify-between px-4 py-2 gap-3">
              <span className="text-xs text-slate-700 min-w-0 truncate">{ex.name}</span>
              <div className="text-right shrink-0">
                <p className="text-xs text-slate-500">
                  {doneSets.length} sets
                  {bestSet?.weight ? ` · ${bestSet.weight}${log.unit} × ${bestSet.reps}` : ''}
                </p>
                {oneRM && <p className="text-[10px] text-slate-400">~{oneRM} 1RM</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface GroupedSessions {
  date: string
  logs: LogEntry[]
}

export function CollapsibleSessionLog({ groups }: { groups: GroupedSessions[] }) {
  const [showAll, setShowAll] = useState(false)

  if (groups.length === 0) return null

  const first = groups[0]
  const rest = groups.slice(1)
  const hiddenCount = rest.reduce((n, g) => n + g.logs.length, 0)

  function formatDate(date: string) {
    return new Date(date + 'T12:00:00').toLocaleDateString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric',
    })
  }

  function DateDivider({ date }: { date: string }) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-100" />
        <span className="text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-200 rounded-full px-3 py-0.5">
          {formatDate(date)}
        </span>
        <div className="h-px flex-1 bg-slate-100" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Most recent group — always visible */}
      <DateDivider date={first.date} />
      {first.logs.map(log => <SessionCard key={log.id} log={log} />)}

      {/* Older sessions — collapsible */}
      {rest.length > 0 && (
        <>
          {showAll && rest.map(group => (
            <div key={group.date} className="space-y-2">
              <DateDivider date={group.date} />
              {group.logs.map(log => <SessionCard key={log.id} log={log} />)}
            </div>
          ))}

          <button
            onClick={() => setShowAll(v => !v)}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 py-3 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-all"
          >
            {showAll ? (
              <><ChevronUp size={14} /> Hide older sessions</>
            ) : (
              <><ChevronDown size={14} /> Show {hiddenCount} older session{hiddenCount !== 1 ? 's' : ''}</>
            )}
          </button>
        </>
      )}
    </div>
  )
}
