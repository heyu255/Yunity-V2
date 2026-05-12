/** Activity level multipliers for the Mifflin-St Jeor TDEE formula. */
export const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
}

/**
 * Calculates Basal Metabolic Rate using the Mifflin-St Jeor equation.
 * @param weightKg  Body weight in kilograms.
 * @param heightCm  Height in centimetres.
 * @param age       Age in years.
 * @param gender    'male' or 'female'.
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female',
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  return gender === 'male' ? base + 5 : base - 161
}

/**
 * Calculates the daily calorie target from BMR, activity level, and goal.
 * @param bmr           Result of calculateBMR.
 * @param activityLevel One of the keys in ACTIVITY_MULTIPLIERS.
 * @param goal          'lose' | 'gain' | 'maintain' (or any other string → no adjustment).
 */
export function calculateDailyCalories(
  bmr: number,
  activityLevel: string,
  goal: string,
): number {
  let calories = Math.round(bmr * (ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.2))
  if (goal === 'lose') calories -= 500
  if (goal === 'gain') calories += 500
  return calories
}
