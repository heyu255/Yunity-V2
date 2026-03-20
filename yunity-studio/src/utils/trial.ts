const TRIAL_DAYS = 7

export function getTrialStatus(userCreatedAt: string) {
  const created = new Date(userCreatedAt)
  const daysElapsed = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24)
  const isOnTrial = daysElapsed < TRIAL_DAYS
  const daysLeft = Math.max(1, Math.ceil(TRIAL_DAYS - daysElapsed))
  return { isOnTrial, daysLeft }
}
