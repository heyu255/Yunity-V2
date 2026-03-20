'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { resetWorkoutData } from '../fitness-actions'
import { Loader2 } from 'lucide-react'

export function ResetWorkoutButton() {
  const [confirming, setConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleReset() {
    startTransition(async () => {
      await resetWorkoutData()
      router.refresh()
      setConfirming(false)
    })
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-slate-500 hidden sm:block">Are you sure?</span>
        <button
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleReset}
          disabled={isPending}
          className="rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-50 px-3 py-1.5 text-xs font-bold text-white transition-colors flex items-center gap-1.5"
        >
          {isPending && <Loader2 size={12} className="animate-spin" />}
          {isPending ? 'Resetting...' : 'Yes, Reset'}
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
    >
      Reset
    </button>
  )
}
