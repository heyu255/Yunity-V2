export type SetLog = {
  set_number: number
  reps: number | null
  weight: number | null
  completed: boolean
  duration_min?: number | null
  distance?: number | null
}

export type ExerciseLog = {
  name: string
  sets: SetLog[]
}

const COMPOUND_PATTERN = /squat|deadlift|bench|row|pull.?up|chin.?up|overhead press|ohp|lunge|hip thrust|leg press|dip|clean|snatch|press/i
const CARDIO_PATTERN = /jog|run|walk|hik|cycl|bik|spin|swim|jump\s?rope|skip|elliptical|stair|treadmill|cardio|hiit|sprint|assault\s?bike|cross\s?trainer/i
const TIMED_PATTERN = /plank|side\s?plank|wall\s?sit|dead\s?hang|l.?sit|hollow\s?hold|static\s?hold|isometric|farmer.?hold/i
const BODYWEIGHT_PATTERN = /push.?up|pull.?up|chin.?up|burpee|crunch|sit.?up|leg\s?raise|knee\s?raise|mountain\s?climber|box\s?jump|jump\s?squat|flutter\s?kick|v.?up|russian\s?twist|bicycle\s?crunch|reverse\s?crunch|superman|inchworm|bear\s?crawl|hip\s?raise|glute\s?bridge|air\s?squat|jumping\s?jack/i

/**
 * Estimates calories burned during a resistance training session.
 * Uses the MET (Metabolic Equivalent of Task) formula:
 *   Calories = MET × weight_kg × duration_hours
 *
 * Duration is estimated from completed sets × avg minutes per set
 * (active work time + rest), which varies by exercise type.
 * Compound lifts get a higher MET and longer assumed rest.
 *
 * @param exerciseLogs  Exercise logs with weights already in kg.
 * @param userWeightKg  The user's body weight in kg.
 */
export function estimateCaloriesBurned(exerciseLogs: ExerciseLog[], userWeightKg: number): number {
  let totalCalories = 0

  for (const ex of exerciseLogs) {
    const completedSets = ex.sets.filter(s => s.completed)
    if (completedSets.length === 0) continue

    const name = ex.name.toLowerCase()

    if (CARDIO_PATTERN.test(name)) {
      const totalDurationMin = completedSets.reduce((sum, s) => sum + (s.duration_min ?? 20), 0)
      let cardioMET = 7.5
      if (/walk|hik/.test(name)) cardioMET = 3.5
      else if (/cycl|bik|spin/.test(name)) cardioMET = 6.0
      else if (/swim/.test(name)) cardioMET = 6.0
      else if (/hiit|sprint/.test(name)) cardioMET = 9.0
      totalCalories += Math.round(cardioMET * userWeightKg * (totalDurationMin / 60))
    } else if (TIMED_PATTERN.test(name)) {
      const totalDurationMin = completedSets.reduce((sum, s) => sum + (s.duration_min ?? 0.5), 0)
      totalCalories += Math.round(4.0 * userWeightKg * (totalDurationMin / 60))
    } else if (BODYWEIGHT_PATTERN.test(name)) {
      const totalMinutes = completedSets.length * 1.5
      totalCalories += Math.round(4.5 * userWeightKg * (totalMinutes / 60))
    } else {
      const isCompound = COMPOUND_PATTERN.test(name)
      const totalMinutes = completedSets.length * (isCompound ? 2.75 : 2.0)
      totalCalories += Math.round(5.0 * userWeightKg * (totalMinutes / 60))
    }
  }

  return totalCalories
}
