'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function BackNavigation() {
  const router = useRouter()

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        Back
      </button>
      <Link
        href="/"
        className="text-sm text-slate-400 transition-colors hover:text-slate-700"
      >
        Home
      </Link>
    </div>
  )
}
