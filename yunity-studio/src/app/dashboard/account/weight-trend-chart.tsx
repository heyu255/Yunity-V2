'use client'

import { useMemo, useState } from 'react'

type WeightEntry = {
  weight: number
  created_at: string
}

type WeightTrendChartProps = {
  entries: WeightEntry[]
  goal: string | null | undefined
}

function formatDateLabel(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

type RangeKey = '7d' | '30d' | '90d' | 'all'

const RANGE_OPTIONS: Array<{ label: string; value: RangeKey }> = [
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
  { label: 'All', value: 'all' },
]

function filterByRange(entries: WeightEntry[], range: RangeKey) {
  if (range === 'all' || entries.length === 0) return entries
  const latest = new Date(entries[entries.length - 1].created_at).getTime()
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
  const cutoff = latest - days * 24 * 60 * 60 * 1000
  return entries.filter((entry) => new Date(entry.created_at).getTime() >= cutoff)
}

function smoothEntries(entries: WeightEntry[]) {
  return entries.map((entry, index) => {
    const start = Math.max(0, index - 2)
    const window = entries.slice(start, index + 1)
    const avg = window.reduce((sum, item) => sum + item.weight, 0) / window.length
    return { ...entry, weight: avg }
  })
}

function projectedGoalWeight(entries: WeightEntry[], goal: string | null | undefined) {
  if (entries.length === 0) return null
  if (!goal || goal === 'maintain') return entries[0].weight

  const startDate = new Date(entries[0].created_at).getTime()
  const endDate = new Date(entries[entries.length - 1].created_at).getTime()
  const elapsedDays = Math.max((endDate - startDate) / (24 * 60 * 60 * 1000), 0)
  const weeklyDelta = 0.5
  const delta = (elapsedDays / 7) * weeklyDelta

  if (goal === 'lose') return entries[0].weight - delta
  if (goal === 'gain') return entries[0].weight + delta
  return entries[0].weight
}

export default function WeightTrendChart({ entries, goal }: WeightTrendChartProps) {
  const [selectedRange, setSelectedRange] = useState<RangeKey>('30d')
  const [showSmoothed, setShowSmoothed] = useState(false)

  const rangeEntries = useMemo(() => filterByRange(entries, selectedRange), [entries, selectedRange])
  const chartEntries = useMemo(() => (showSmoothed ? smoothEntries(rangeEntries) : rangeEntries), [rangeEntries, showSmoothed])
  const goalWeight = useMemo(() => projectedGoalWeight(rangeEntries, goal), [rangeEntries, goal])

  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
        No weight history yet. Update your weight to start tracking your progress.
      </div>
    )
  }

  if (rangeEntries.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelectedRange(option.value)}
              className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${
                selectedRange === option.value
                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          No entries found in this time range.
        </div>
      </div>
    )
  }

  const values = chartEntries.map((entry) => entry.weight)
  if (goalWeight !== null) values.push(goalWeight)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const valueRange = Math.max(max - min, 1)
  const lastIndex = chartEntries.length - 1
  const latest = chartEntries[lastIndex]?.weight ?? 0
  const earliest = chartEntries[0]?.weight ?? latest
  const delta = latest - earliest
  const deltaLabel = `${delta >= 0 ? '+' : ''}${delta.toFixed(1)} kg`

  const width = 600
  const height = 220
  const xPad = 36
  const yPad = 18
  const innerWidth = width - xPad * 2
  const innerHeight = height - yPad * 2

  const points = chartEntries.map((entry, index) => {
    const x = xPad + (index / Math.max(lastIndex, 1)) * innerWidth
    const normalized = (entry.weight - min) / valueRange
    const y = height - yPad - normalized * innerHeight
    return { x, y, entry }
  })

  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`).join(' ')
  const goalY =
    goalWeight === null ? null : height - yPad - ((goalWeight - min) / valueRange) * innerHeight

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelectedRange(option.value)}
              className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${
                selectedRange === option.value
                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowSmoothed((value) => !value)}
          className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${
            showSmoothed
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          {showSmoothed ? 'Smoothing: On' : 'Smoothing: Off'}
        </button>
      </div>

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Weight Change</p>
          <p className="text-2xl font-bold text-slate-900">{deltaLabel}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Latest</p>
          <p className="text-lg font-semibold text-slate-800">{latest.toFixed(1)} kg</p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full">
          <line x1={xPad} y1={yPad} x2={xPad} y2={height - yPad} stroke="#e2e8f0" strokeWidth="1" />
          <line x1={xPad} y1={height - yPad} x2={width - xPad} y2={height - yPad} stroke="#e2e8f0" strokeWidth="1" />
          {goalY !== null && (
            <line
              x1={xPad}
              y1={goalY}
              x2={width - xPad}
              y2={goalY}
              stroke="#f97316"
              strokeWidth="2"
              strokeDasharray="6 6"
            />
          )}
          <path d={path} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />

          {points.map((point, index) => (
            <circle key={`${point.entry.created_at}-${index}`} cx={point.x} cy={point.y} r="4" fill="#2563eb" />
          ))}
        </svg>
        <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            {showSmoothed ? 'Smoothed trend' : 'Raw trend'}
          </span>
          {goalY !== null && (
            <span className="inline-flex items-center gap-1">
              <span className="h-0.5 w-4 bg-orange-500" />
              Goal pace line
            </span>
          )}
        </div>

        <div className="mt-3 flex justify-between text-xs text-slate-500">
          <span>{formatDateLabel(chartEntries[0].created_at)}</span>
          <span>{formatDateLabel(chartEntries[lastIndex].created_at)}</span>
        </div>
        <div className="mt-1 flex justify-between text-xs text-slate-500">
          <span>Low: {min.toFixed(1)} kg</span>
          <span>High: {max.toFixed(1)} kg</span>
        </div>
      </div>
    </div>
  )
}
