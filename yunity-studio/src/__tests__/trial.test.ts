import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getTrialStatus } from '@/utils/trial'

const TRIAL_DAYS = 7
const MS_PER_DAY = 1000 * 60 * 60 * 24

function daysAgo(n: number): string {
  return new Date(Date.now() - n * MS_PER_DAY).toISOString()
}

describe('getTrialStatus', () => {
  it('returns isOnTrial=true and daysLeft=7 for a brand-new user', () => {
    const { isOnTrial, daysLeft } = getTrialStatus(daysAgo(0))
    expect(isOnTrial).toBe(true)
    expect(daysLeft).toBe(TRIAL_DAYS)
  })

  it('returns correct daysLeft mid-trial', () => {
    const { isOnTrial, daysLeft } = getTrialStatus(daysAgo(3))
    expect(isOnTrial).toBe(true)
    // 3 full days elapsed → 4 days remaining (ceil of 4.something)
    expect(daysLeft).toBe(4)
  })

  it('returns daysLeft=1 on the last partial day', () => {
    // 6 days + 23 hours elapsed → < 7 days, ceil(~0.04) = 1
    const created = new Date(Date.now() - (6 * MS_PER_DAY + 23 * 3600 * 1000)).toISOString()
    const { isOnTrial, daysLeft } = getTrialStatus(created)
    expect(isOnTrial).toBe(true)
    expect(daysLeft).toBe(1)
  })

  it('returns isOnTrial=false and daysLeft=0 when exactly 7 days have elapsed', () => {
    const created = new Date(Date.now() - TRIAL_DAYS * MS_PER_DAY - 1).toISOString()
    const { isOnTrial, daysLeft } = getTrialStatus(created)
    expect(isOnTrial).toBe(false)
    expect(daysLeft).toBe(0)
  })

  it('returns isOnTrial=false and daysLeft=0 for a long-expired user', () => {
    const { isOnTrial, daysLeft } = getTrialStatus(daysAgo(30))
    expect(isOnTrial).toBe(false)
    expect(daysLeft).toBe(0)
  })
})
