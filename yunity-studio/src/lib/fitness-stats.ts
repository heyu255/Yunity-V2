/**
 * Computes the current consecutive workout streak in days.
 *
 * @param history    Workout logs with `created_at` ISO strings.
 * @param localDate  The user's local date as "YYYY-MM-DD" (from the yunity_local_date cookie).
 *                   Falls back to server UTC if not provided.
 */
export function computeStreak(
  history: { created_at: string }[],
  localDate?: string,
): number {
  const dates = [...new Set(history.map(l => l.created_at.split('T')[0]))].sort().reverse()
  if (dates.length === 0) return 0

  const today = localDate ?? new Date().toISOString().split('T')[0]
  const yesterday = subtractDay(today, 1)

  if (dates[0] !== today && dates[0] !== yesterday) return 0

  let streak = 1
  for (let i = 1; i < dates.length; i++) {
    const diff = daysBetween(dates[i], dates[i - 1])
    if (diff === 1) streak++
    else break
  }
  return streak
}

/** Returns the total training volume (kg × reps) for a given week. */
export function computeWeekVolume(
  history: { created_at: string; exercise_logs: any[] }[],
  weeksAgo = 0,
): number {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay() - weeksAgo * 7)
  startOfWeek.setHours(0, 0, 0, 0)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 7)

  return history
    .filter(l => {
      const d = new Date(l.created_at)
      return d >= startOfWeek && d < endOfWeek
    })
    .reduce((sum, log) => {
      for (const ex of log.exercise_logs ?? []) {
        for (const set of ex.sets ?? []) {
          if (set.completed && set.weight && set.reps) sum += set.weight * set.reps
        }
      }
      return sum
    }, 0)
}

/** Returns the muscle group / focus that appears most often in the history. */
export function topMuscleGroup(history: { dayFocus: string }[]): string | null {
  const counts: Record<string, number> = {}
  for (const log of history) {
    const focus = (log.dayFocus ?? '').trim()
    if (!focus) continue
    counts[focus] = (counts[focus] ?? 0) + 1
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
}

/** Returns how many whole days have elapsed since the last logged workout. */
export function daysSinceLastWorkout(history: { created_at: string }[]): number | null {
  if (history.length === 0) return null
  const last = new Date(history[0].created_at)
  const now = new Date()
  return Math.floor((now.getTime() - last.getTime()) / 86400000)
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Subtract `n` days from a "YYYY-MM-DD" string and return the result. */
function subtractDay(date: string, n: number): string {
  const [y, m, d] = date.split('-').map(Number)
  const result = new Date(Date.UTC(y, m - 1, d - n))
  return result.toISOString().split('T')[0]
}

/** Number of whole days from `earlier` to `later` (both "YYYY-MM-DD"). */
function daysBetween(earlier: string, later: string): number {
  return Math.round(
    (new Date(later).getTime() - new Date(earlier).getTime()) / 86400000,
  )
}
