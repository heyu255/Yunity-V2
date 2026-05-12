import { describe, it, expect } from 'vitest'
import { estimateCaloriesBurned, type ExerciseLog } from '@/lib/calorie-utils'

const USER_KG = 70

function makeSet(overrides: Partial<{ completed: boolean; weight: number; reps: number; duration_min: number }> = {}) {
  return {
    set_number: 1,
    reps: overrides.reps ?? 10,
    weight: overrides.weight ?? 60,
    completed: overrides.completed ?? true,
    duration_min: overrides.duration_min ?? null,
  }
}

describe('estimateCaloriesBurned', () => {
  it('returns 0 for an empty exercise list', () => {
    expect(estimateCaloriesBurned([], USER_KG)).toBe(0)
  })

  it('returns 0 when all sets are incomplete', () => {
    const logs: ExerciseLog[] = [
      { name: 'Bench Press', sets: [makeSet({ completed: false }), makeSet({ completed: false })] },
    ]
    expect(estimateCaloriesBurned(logs, USER_KG)).toBe(0)
  })

  it('estimates calories for a compound lift (bench press, 3 sets)', () => {
    // isCompound=true → totalMinutes = 3 × 2.75 = 8.25 → Math.round(5 × 70 × 8.25/60) = 48
    const logs: ExerciseLog[] = [
      { name: 'Bench Press', sets: [makeSet(), makeSet(), makeSet()] },
    ]
    expect(estimateCaloriesBurned(logs, USER_KG)).toBe(48)
  })

  it('estimates calories for an isolation exercise (bicep curl, 3 sets)', () => {
    // isCompound=false → totalMinutes = 3 × 2.0 = 6.0 → Math.round(5 × 70 × 6/60) = 35
    const logs: ExerciseLog[] = [
      { name: 'Bicep Curl', sets: [makeSet(), makeSet(), makeSet()] },
    ]
    expect(estimateCaloriesBurned(logs, USER_KG)).toBe(35)
  })

  it('estimates calories for cardio (running, 30 min)', () => {
    // cardioMET=7.5 → Math.round(7.5 × 70 × 30/60) = 263
    const logs: ExerciseLog[] = [
      { name: 'Running', sets: [makeSet({ duration_min: 30 })] },
    ]
    expect(estimateCaloriesBurned(logs, USER_KG)).toBe(263)
  })

  it('uses MET=3.5 for walking', () => {
    // Math.round(3.5 × 70 × 20/60) = Math.round(81.67) = 82
    const logs: ExerciseLog[] = [
      { name: 'Walk', sets: [makeSet()] }, // duration_min defaults to 20 when null
    ]
    expect(estimateCaloriesBurned(logs, USER_KG)).toBe(82)
  })

  it('uses MET=9.0 for HIIT', () => {
    // Math.round(9.0 × 70 × 20/60) = Math.round(210) = 210
    const logs: ExerciseLog[] = [
      { name: 'HIIT', sets: [makeSet()] },
    ]
    expect(estimateCaloriesBurned(logs, USER_KG)).toBe(210)
  })

  it('estimates calories for a timed exercise (plank, 2 × 1.5 min)', () => {
    // Math.round(4.0 × 70 × 3/60) = Math.round(14) = 14
    const logs: ExerciseLog[] = [
      { name: 'Plank', sets: [makeSet({ duration_min: 1.5 }), makeSet({ duration_min: 1.5 })] },
    ]
    expect(estimateCaloriesBurned(logs, USER_KG)).toBe(14)
  })

  it('falls back to 0.5 min per set for timed exercises without duration', () => {
    // totalDurationMin = 2 × 0.5 = 1 → Math.round(4.0 × 70 × 1/60) = Math.round(4.67) = 5
    const logs: ExerciseLog[] = [
      { name: 'Plank', sets: [makeSet({ duration_min: undefined }), makeSet({ duration_min: undefined })] },
    ]
    expect(estimateCaloriesBurned(logs, USER_KG)).toBe(5)
  })

  it('estimates calories for a bodyweight exercise (push-up, 4 sets)', () => {
    // totalMinutes = 4 × 1.5 = 6 → Math.round(4.5 × 70 × 6/60) = Math.round(31.5) = 32
    const logs: ExerciseLog[] = [
      { name: 'Push-up', sets: [makeSet(), makeSet(), makeSet(), makeSet()] },
    ]
    expect(estimateCaloriesBurned(logs, USER_KG)).toBe(32)
  })

  it('skips incomplete sets in bodyweight exercises', () => {
    // Only 2 completed sets: 2 × 1.5 = 3 min → Math.round(4.5 × 70 × 3/60) = Math.round(15.75) = 16
    const logs: ExerciseLog[] = [
      {
        name: 'Push-up',
        sets: [makeSet(), makeSet(), makeSet({ completed: false }), makeSet({ completed: false })],
      },
    ]
    expect(estimateCaloriesBurned(logs, USER_KG)).toBe(16)
  })

  it('accumulates calories across multiple exercises', () => {
    const bench = estimateCaloriesBurned(
      [{ name: 'Bench Press', sets: [makeSet(), makeSet(), makeSet()] }],
      USER_KG,
    )
    const curl = estimateCaloriesBurned(
      [{ name: 'Bicep Curl', sets: [makeSet(), makeSet(), makeSet()] }],
      USER_KG,
    )
    const combined = estimateCaloriesBurned(
      [
        { name: 'Bench Press', sets: [makeSet(), makeSet(), makeSet()] },
        { name: 'Bicep Curl', sets: [makeSet(), makeSet(), makeSet()] },
      ],
      USER_KG,
    )
    expect(combined).toBe(bench + curl)
  })

  it('scales linearly with user body weight', () => {
    const logs: ExerciseLog[] = [{ name: 'Squat', sets: [makeSet(), makeSet()] }]
    const cal60 = estimateCaloriesBurned(logs, 60)
    const cal90 = estimateCaloriesBurned(logs, 90)
    // Ratio should be close to 90/60 = 1.5 (rounding may introduce small differences)
    expect(cal90 / cal60).toBeCloseTo(1.5, 0)
  })
})
