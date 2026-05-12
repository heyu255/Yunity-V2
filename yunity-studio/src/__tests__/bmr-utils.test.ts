import { describe, it, expect } from 'vitest'
import { calculateBMR, calculateDailyCalories, ACTIVITY_MULTIPLIERS } from '@/lib/bmr-utils'

describe('calculateBMR', () => {
  // Male, 25y, 70kg, 175cm → base = 700 + 1093.75 - 125 = 1668.75 → +5 = 1673.75
  it('calculates male BMR correctly', () => {
    expect(calculateBMR(70, 175, 25, 'male')).toBeCloseTo(1673.75, 2)
  })

  // Female → 1668.75 - 161 = 1507.75
  it('calculates female BMR correctly', () => {
    expect(calculateBMR(70, 175, 25, 'female')).toBeCloseTo(1507.75, 2)
  })

  it('increases BMR with higher body weight', () => {
    const light = calculateBMR(60, 170, 30, 'male')
    const heavy = calculateBMR(90, 170, 30, 'male')
    expect(heavy).toBeGreaterThan(light)
  })

  it('decreases BMR with greater age', () => {
    const young = calculateBMR(70, 175, 20, 'male')
    const old = calculateBMR(70, 175, 50, 'male')
    expect(old).toBeLessThan(young)
  })
})

describe('calculateDailyCalories', () => {
  const bmr = 1673.75

  it('applies sedentary multiplier', () => {
    expect(calculateDailyCalories(bmr, 'sedentary', 'maintain')).toBe(
      Math.round(bmr * ACTIVITY_MULTIPLIERS.sedentary),
    )
  })

  it('applies moderate multiplier', () => {
    expect(calculateDailyCalories(bmr, 'moderate', 'maintain')).toBe(
      Math.round(bmr * ACTIVITY_MULTIPLIERS.moderate),
    )
  })

  it('subtracts 500 for weight-loss goal', () => {
    const maintain = calculateDailyCalories(bmr, 'moderate', 'maintain')
    const lose = calculateDailyCalories(bmr, 'moderate', 'lose')
    expect(maintain - lose).toBe(500)
  })

  it('adds 500 for muscle-gain goal', () => {
    const maintain = calculateDailyCalories(bmr, 'moderate', 'maintain')
    const gain = calculateDailyCalories(bmr, 'moderate', 'gain')
    expect(gain - maintain).toBe(500)
  })

  it('falls back to sedentary multiplier for unknown activity level', () => {
    expect(calculateDailyCalories(bmr, 'unknown', 'maintain')).toBe(
      Math.round(bmr * 1.2),
    )
  })
})
