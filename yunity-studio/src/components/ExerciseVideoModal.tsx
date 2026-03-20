'use client'

import { useState, useEffect } from 'react'
import { Play, X } from 'lucide-react'
import { getExerciseVideoId } from '@/data/exercise-videos'

export function ExerciseVideoButton({ exerciseName }: { exerciseName: string }) {
  const [open, setOpen] = useState(false)
  const videoId = getExerciseVideoId(exerciseName)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-slate-700 hover:bg-emerald-500 transition-colors shrink-0"
        title={`Watch ${exerciseName} demo`}
      >
        <Play size={8} fill="white" className="text-white ml-px" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 pb-24 sm:pb-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl overflow-hidden bg-slate-900 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="text-sm font-bold text-white truncate">{exerciseName}</span>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white transition-colors ml-3 shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Video */}
            {videoId ? (
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`${exerciseName} tutorial`}
                />
              </div>
            ) : (
              <div className="aspect-video flex flex-col items-center justify-center gap-3 bg-slate-800">
                <Play size={32} className="text-slate-500" />
                <p className="text-slate-400 text-sm">No demo available yet</p>
              </div>
            )}

            {/* Always-visible YouTube search link */}
            <div className="px-4 py-2.5 border-t border-white/10 flex justify-end">
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseName + ' exercise tutorial form')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
              >
                Search on YouTube ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
