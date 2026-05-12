import { describe, it, expect } from 'vitest'
import { computeStreak, computeWeekVolume, topMuscleGroup, daysSinceLastWorkout } from '@/lib/fitness-stats'

// ── Helpers ────────────────────────────────────────────────────────────────

function isoDate(daysAgo: number): string {
  return new Date(Date.now() - daysAgo * 86400000).toISOString().split('T')[0]
}

function makeLog(daysAgo: number, exerciseLogs: any[] = []) {
  return {
    created_at: new Date(Date.now() - daysAgo * 86400000).toISOString(),
    exercise_logs: exerciseLogs,
    dayFocus: '',
  }
}

// ── computeStreak ──────────────────────────────────────────────────────────

describe('computeStreak', () => {
  const today = isoDate(0)

  it('returns 0 for an empty history', () => {
    expect(computeStreak([], today)).toBe(0)
  })

  it('returns 1 when only today has a workout', () => {
    expect(computeStreak([makeLog(0)], today)).toBe(1)
  })

  it('returns 1 when only yesterday has a workout', () => {
    expect(computeStreak([makeLog(1)], today)).toBe(1)
  })

  it('returns 0 when the last workout was 2+ days ago', () => {
    expect(computeStreak([makeLog(2)], today)).toBe(0)
    expect(computeStreak([makeLog(5)], today)).toBe(0)
  })

  it('counts consecutive days correctly', () => {
    const history = [makeLog(0), makeLog(1), makeLog(2), makeLog(3)]
    expect(computeStreak(history, today)).toBe(4)
  })

  it('stops at the first gap', () => {
    // Today, yesterday, then a gap, then older
    const history = [makeLog(0), makeLog(1), makeLog(3), makeLog(4)]
    expect(computeStreak(history, today)).toBe(2)
  })

  it('deduplicates multiple logs on the same date', () => {
    // Two logs today + one yesterday → streak of 2 (not 3)
    const history = [makeLog(0), makeLog(0), makeLog(1)]
    expect(computeStreak(history, today)).toBe(2)
  })
})

// ── computeWeekVolume ──────────────────────────────────────────────────────

describe('computeWeekVolume', () => {
  it('returns 0 for an empty history', () => {
    expect(computeWeekVolume([], 0)).toBe(0)
  })

  it('sums completed set volumes within the current week', () => {
    const sets = [
      { completed: true, weight: 100, reps: 5 },   // 500
      { completed: true, weight: 80, reps: 8 },    // 640
      { completed: false, weight: 60, reps: 10 },  // skipped
    ]
    const history = [{ ...makeLog(0), exercise_logs: [{ name: 'Squat', sets }] }]
    expect(computeWeekVolume(history, 0)).toBe(1140)
  })

  it('excludes logs from the previous week when weeksAgo=0', () => {
    const thisWeek = { ...makeLog(0), exercise_logs: [{ name: 'Bench', sets: [{ completed: true, weight: 50, reps: 10 }] }] }
    const lastWeek = { ...makeLog(8), exercise_logs: [{ name: 'Bench', sets: [{ completed: true, weight: 50, reps: 10 }] }] }
    expect(computeWeekVolume([thisWeek, lastWeek], 0)).toBe(500)
  })
})

// ── topMuscleGroup ─────────────────────────────────────────────────────────

describe('topMuscleGroup', () => {
  it('returns null for an empty history', () => {
    expect(topMuscleGroup([])).toBeNull()
  })

  it('returns the most frequent focus', () => {
    const history = [
      { dayFocus: 'Chest' },
      { dayFocus: 'Chest' },
      { dayFocus: 'Back' },
      { dayFocus: 'Legs' },
    ]
    expect(topMuscleGroup(history)).toBe('Chest')
  })

  it('ignores empty focus strings', () => {
    const history = [{ dayFocus: '' }, { dayFocus: 'Back' }, { dayFocus: 'Back' }]
    expect(topMuscleGroup(history)).toBe('Back')
  })
})

// ── daysSinceLastWorkout ───────────────────────────────────────────────────

describe('daysSinceLastWorkout', () => {
  it('returns null for an empty history', () => {
    expect(daysSinceLastWorkout([])).toBeNull()
  })

  it('returns 0 for a workout logged today', () => {
    expect(daysSinceLastWorkout([makeLog(0)])).toBe(0)
  })

  it('returns 1 for a workout logged yesterday', () => {
    expect(daysSinceLastWorkout([makeLog(1)])).toBe(1)
  })

  it('reads from the first entry (most recent) when history is unsorted', () => {
    // history[0] is assumed to be the most recent
    const history = [makeLog(1), makeLog(5)]
    expect(daysSinceLastWorkout(history)).toBe(1)
  })
})
