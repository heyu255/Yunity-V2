'use client'

import { useState, useEffect, useTransition } from 'react'
import { getExerciseHistory } from '@/app/dashboard/fitness/fitness-actions'
import { Loader2, ArrowUp, ArrowDown, Minus, Sparkles } from 'lucide-react'

type DataPoint = { date: string; maxWeight: number; maxOneRM: number; unit: string }

// Linear regression over 1RM values indexed by days since first session
function linearRegression(data: DataPoint[]) {
  if (data.length < 2) return null
  const t0 = new Date(data[0].date).getTime()
  const xs = data.map(d => (new Date(d.date).getTime() - t0) / 86400000)
  const ys = data.map(d => d.maxOneRM)
  const n = xs.length
  const sumX = xs.reduce((a, b) => a + b, 0)
  const sumY = ys.reduce((a, b) => a + b, 0)
  const sumXY = xs.reduce((s, x, i) => s + x * ys[i], 0)
  const sumX2 = xs.reduce((s, x) => s + x * x, 0)
  const denom = n * sumX2 - sumX * sumX
  if (denom === 0) return null
  const slope = (n * sumXY - sumX * sumY) / denom
  const intercept = (sumY - slope * sumX) / n
  return { slope, intercept, lastX: xs[xs.length - 1] }
}

function predict1RM(data: DataPoint[], daysAhead: number): number | null {
  const reg = linearRegression(data)
  if (!reg || reg.slope <= 0) return null
  const predicted = reg.intercept + reg.slope * (reg.lastX + daysAhead)
  return Math.round(predicted * 10) / 10
}

function ProgressChart({ data }: { data: DataPoint[] }) {
  if (data.length < 2) {
    return (
      <div className="h-36 flex flex-col items-center justify-center text-slate-400 text-sm rounded-xl bg-slate-50 border border-dashed border-slate-200">
        <span className="text-2xl mb-1">📊</span>
        Log this exercise again to see your progression
      </div>
    )
  }

  const W = 560
  const H = 170
  // Extra right padding to fit the projected point
  const PAD = { top: 14, right: 60, bottom: 32, left: 44 }
  const cW = W - PAD.left - PAD.right
  const cH = H - PAD.top - PAD.bottom

  const reg = linearRegression(data)
  // Project 30 days ahead if slope is positive
  const projDays = reg && reg.slope > 0 ? 30 : 0

  // x-axis: map session index 0..n-1 across cW, plus a projected point at n
  const totalPts = data.length + (projDays > 0 ? 1 : 0)

  const vals = data.map(d => d.maxWeight)
  const maxY = Math.max(...vals)
  const minY = Math.min(...vals)
  const range = maxY - minY || 1

  // projected 1RM converted to "weight equivalent" for y-axis — approximate by
  // using the latest reps to back-calculate: w = 1RM / (1 + reps/30)
  // We'll just plot the projected weight as the predicted 1RM scaled on the same axis
  // to keep it simple, project maxWeight using the weight regression too
  const weightReg = (() => {
    const t0 = new Date(data[0].date).getTime()
    const xs = data.map(d => (new Date(d.date).getTime() - t0) / 86400000)
    const ys = data.map(d => d.maxWeight)
    const n = xs.length
    const sumX = xs.reduce((a, b) => a + b, 0)
    const sumY = ys.reduce((a, b) => a + b, 0)
    const sumXY = xs.reduce((s, x, i) => s + x * ys[i], 0)
    const sumX2 = xs.reduce((s, x) => s + x * x, 0)
    const denom = n * sumX2 - sumX * sumX
    if (denom === 0) return null
    const slope = (n * sumXY - sumX * sumY) / denom
    const intercept = (sumY - slope * sumX) / n
    return { slope, intercept, lastX: xs[xs.length - 1] }
  })()

  const projWeight = weightReg && weightReg.slope > 0
    ? Math.round((weightReg.intercept + weightReg.slope * (weightReg.lastX + projDays)) * 10) / 10
    : null

  const allVals = projWeight ? [...vals, projWeight] : vals
  const chartMax = Math.max(...allVals)
  const chartMin = Math.min(...allVals)
  const chartRange = chartMax - chartMin || 1

  function toX(idx: number) {
    return PAD.left + (idx / Math.max(totalPts - 1, 1)) * cW
  }
  function toY(val: number) {
    return PAD.top + ((chartMax - val) / chartRange) * cH
  }

  const pts = data.map((d, i) => ({ x: toX(i), y: toY(d.maxWeight), ...d }))
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  const areaD = `${pathD} L ${pts[pts.length - 1].x.toFixed(1)} ${(PAD.top + cH).toFixed(1)} L ${PAD.left} ${(PAD.top + cH).toFixed(1)} Z`

  const projPt = projWeight !== null ? { x: toX(data.length), y: toY(projWeight) } : null
  const last = pts[pts.length - 1]

  const ticks = [0, 0.5, 1].map(t => ({
    y: PAD.top + t * cH,
    val: Math.round(chartMax - t * chartRange),
  }))

  const labelIdxs = [...new Set([0, Math.floor((data.length - 1) / 2), data.length - 1])]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-44">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>

      {/* Grid */}
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={PAD.left} x2={W - PAD.right} y1={t.y} y2={t.y} stroke="#f1f5f9" strokeWidth={1} />
          <text x={PAD.left - 6} y={t.y + 4} textAnchor="end" fontSize={9} fill="#94a3b8" fontWeight="600">{t.val}</text>
        </g>
      ))}

      {/* Area fill */}
      <path d={areaD} fill="url(#areaGrad)" />

      {/* Historical line */}
      <path d={pathD} fill="none" stroke="url(#lineGrad)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

      {/* Projected dashed line */}
      {projPt && (
        <>
          <line
            x1={last.x.toFixed(1)} y1={last.y.toFixed(1)}
            x2={projPt.x.toFixed(1)} y2={projPt.y.toFixed(1)}
            stroke="#a78bfa" strokeWidth={2} strokeDasharray="5 4" strokeLinecap="round"
          />
          {/* Projected point */}
          <circle cx={projPt.x} cy={projPt.y} r={6} fill="#7c3aed" opacity={0.15} />
          <circle cx={projPt.x} cy={projPt.y} r={3.5} fill="#a78bfa" stroke="white" strokeWidth={1.5} />
          {/* "+30d" label */}
          <text x={projPt.x + 8} y={projPt.y + 4} fontSize={8} fill="#a78bfa" fontWeight="700">+30d</text>
        </>
      )}

      {/* Historical dots */}
      {pts.map((p, i) => (
        <g key={i}>
          {i === pts.length - 1 ? (
            <>
              <circle cx={p.x} cy={p.y} r={6} fill="#7c3aed" opacity={0.2} />
              <circle cx={p.x} cy={p.y} r={3.5} fill="#7c3aed" />
            </>
          ) : (
            <circle cx={p.x} cy={p.y} r={2.5} fill="white" stroke="#7c3aed" strokeWidth={1.5} />
          )}
        </g>
      ))}

      {/* X labels */}
      {labelIdxs.map(idx => (
        <text key={idx} x={pts[idx].x} y={H - 4} textAnchor="middle" fontSize={9} fill="#94a3b8" fontWeight="600">
          {new Date(data[idx].date + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </text>
      ))}
    </svg>
  )
}

export function ExerciseChart({ exerciseNames }: { exerciseNames: string[] }) {
  const [selected, setSelected] = useState(exerciseNames[0] ?? '')
  const [data, setData] = useState<DataPoint[]>([])
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!selected) return
    startTransition(async () => {
      const result = await getExerciseHistory(selected)
      setData(result)
    })
  }, [selected])

  if (exerciseNames.length === 0) return null

  const latest = data[data.length - 1]
  const first = data[0]
  const delta = latest && first ? Math.round((latest.maxWeight - first.maxWeight) * 10) / 10 : null
  const isUp = delta !== null && delta > 0
  const isFlat = delta === 0

  const predicted30 = data.length >= 3 ? predict1RM(data, 30) : null
  const predicted90 = data.length >= 3 ? predict1RM(data, 90) : null

  return (
    <div className="space-y-4">
      {/* Exercise selector + delta */}
      <div className="flex items-center gap-3">
        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
          className="flex-1 min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        >
          {exerciseNames.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>

        {delta !== null && data.length >= 2 && (
          <div className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-bold shrink-0 ${
            isFlat ? 'bg-slate-100 text-slate-500' : isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
          }`}>
            {isFlat ? <Minus size={14} /> : isUp ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
            {isUp ? '+' : ''}{delta} {latest.unit}
          </div>
        )}
      </div>

      {/* Chart */}
      {isPending ? (
        <div className="h-40 flex items-center justify-center text-slate-300">
          <Loader2 size={22} className="animate-spin" />
        </div>
      ) : (
        <ProgressChart data={data} />
      )}

      {/* Stats row */}
      {latest && data.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-center flex-1 min-w-[72px]">
            <p className="text-sm font-bold text-slate-900">{latest.maxWeight} {latest.unit}</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mt-0.5">Best Weight</p>
          </div>
          <div className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-center flex-1 min-w-[72px]">
            <p className="text-sm font-bold text-violet-700">{latest.maxOneRM} {latest.unit}</p>
            <p className="text-[10px] text-violet-400 font-semibold uppercase tracking-wide mt-0.5">Est. 1RM</p>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-center flex-1 min-w-[72px]">
            <p className="text-sm font-bold text-slate-900">{data.length}</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mt-0.5">Sessions</p>
          </div>
        </div>
      )}

      {/* Predicted 1RM — only when trend is upward and enough data */}
      {(predicted30 || predicted90) && (
        <div className="rounded-xl border border-violet-200 bg-violet-50/60 p-3 space-y-2">
          <div className="flex items-center gap-1.5">
            <Sparkles size={13} className="text-violet-500" />
            <span className="text-xs font-bold text-violet-700">Predicted 1RM</span>
            <span className="text-[10px] text-violet-400 ml-1">based on your trend</span>
          </div>
          <div className="flex gap-2">
            {predicted30 && (
              <div className="flex-1 rounded-lg bg-white border border-violet-100 px-3 py-2 text-center">
                <p className="text-base font-black text-violet-700">{predicted30} {latest?.unit}</p>
                <p className="text-[10px] text-violet-400 font-semibold uppercase tracking-wide mt-0.5">In 30 days</p>
              </div>
            )}
            {predicted90 && (
              <div className="flex-1 rounded-lg bg-white border border-violet-100 px-3 py-2 text-center">
                <p className="text-base font-black text-violet-700">{predicted90} {latest?.unit}</p>
                <p className="text-[10px] text-violet-400 font-semibold uppercase tracking-wide mt-0.5">In 90 days</p>
              </div>
            )}
          </div>
          <p className="text-[10px] text-violet-300 leading-relaxed">
            Projection assumes consistent training at your current rate of progression.
          </p>
        </div>
      )}
    </div>
  )
}
