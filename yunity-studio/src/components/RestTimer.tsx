'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface RestTimerProps {
  seconds: number
  exerciseName: string
  onDismiss: () => void
}

export function RestTimer({ seconds, exerciseName, onDismiss }: RestTimerProps) {
  const t = useTranslations('rest_timer')
  const [remaining, setRemaining] = useState(seconds)
  const done = remaining <= 0
  const progress = Math.max(0, 1 - remaining / seconds)
  const r = 30
  const circumference = 2 * Math.PI * r

  useEffect(() => {
    if (done) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([200, 100, 200])
      return
    }
    const t = setInterval(() => setRemaining(v => v - 1), 1000)
    return () => clearInterval(t)
  }, [done])

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const timeStr = mins > 0
    ? `${mins}:${secs.toString().padStart(2, '0')}`
    : `${remaining}`

  return (
    <div className={`fixed bottom-24 right-4 sm:bottom-8 sm:right-6 z-50 w-48 rounded-2xl shadow-2xl border animate-in slide-in-from-bottom-4 fade-in duration-300 overflow-hidden ${
      done ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'
    }`}>
      {/* Top strip */}
      <div className={`px-4 pt-3 pb-1 flex items-center justify-between ${done ? '' : ''}`}>
        <span className={`text-[10px] font-bold uppercase tracking-widest ${done ? 'text-emerald-600' : 'text-slate-400'}`}>
          {done ? t('ready') : t('title')}
        </span>
        <button onClick={onDismiss} className={`transition-colors ${done ? 'text-emerald-400 hover:text-emerald-600' : 'text-slate-300 hover:text-slate-600'}`}>
          <X size={14} />
        </button>
      </div>

      <p className="px-4 pb-2 text-[11px] text-slate-400 truncate">{exerciseName}</p>

      {/* Ring */}
      <div className="flex justify-center pb-2">
        <div className="relative">
          <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
            <circle cx="40" cy="40" r={r} fill="none" stroke={done ? '#d1fae5' : '#f1f5f9'} strokeWidth="5" />
            <circle
              cx="40" cy="40" r={r}
              fill="none"
              stroke={done ? '#10b981' : '#7c3aed'}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={`${circumference * (1 - progress)}`}
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xl font-black ${done ? 'text-emerald-600' : 'text-slate-900'}`}>
              {done ? '✓' : timeStr}
            </span>
          </div>
        </div>
      </div>

      {/* Button */}
      <div className="px-3 pb-3">
        <button
          onClick={onDismiss}
          className={`w-full rounded-xl py-2 text-xs font-bold transition-all ${
            done
              ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {done ? t('start_next') : t('skip')}
        </button>
      </div>
    </div>
  )
}
