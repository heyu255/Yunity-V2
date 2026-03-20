'use client'

import { useState } from 'react'
import { Zap, X } from 'lucide-react'
import { createCheckoutSession } from '@/app/dashboard/stripe-actions'

export function TrialBanner({ daysLeft }: { daysLeft: number }) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  const urgent = daysLeft <= 2

  return (
    <div className={`relative flex items-center justify-between gap-3 px-4 py-2.5 text-sm ${
      urgent
        ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white'
        : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white'
    }`}>
      {/* Left: message */}
      <div className="flex items-center gap-2 min-w-0 overflow-hidden">
        <Zap size={14} className="shrink-0 opacity-90" />
        <div className="overflow-hidden min-w-0">
          <p className="text-xs font-semibold whitespace-nowrap animate-marquee">
            {urgent
              ? `⚠️ Your free trial ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'} — upgrade to keep premium access.`
              : `🎉 You're on a free ${7}-day trial — ${daysLeft} day${daysLeft === 1 ? '' : 's'} remaining. Enjoy all premium features!`
            }
          </p>
        </div>
      </div>

      {/* Right: CTA + dismiss */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => createCheckoutSession()}
          className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
            urgent
              ? 'bg-white text-rose-600 hover:bg-rose-50'
              : 'bg-white text-violet-700 hover:bg-violet-50'
          }`}
        >
          Upgrade
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
