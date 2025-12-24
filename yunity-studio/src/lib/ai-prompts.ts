export const WORKOUT_GEN_PROMPT = (profile: any) => `
  You are a professional performance coach. Generate a 7-day workout split for a user with the following profile:
  - Weight: ${profile.weight_kg}kg
  - Height: ${profile.height_cm}cm
  - Goal: ${profile.goal} (e.g., muscle gain, weight loss)

  Return the response STRICTLY as a JSON object with this structure:
  {
    "split_name": "Push/Pull/Legs",
    "days": [
      {
        "day": 1,
        "focus": "Chest & Triceps",
        "exercises": [
          { "name": "Bench Press", "sets": 3, "reps": "8-12", "notes": "Focus on form" }
        ]
      }
      // ... up to 7 days
    ]
  }
`;