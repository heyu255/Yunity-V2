import { completeOnboarding } from './actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

// Onboarding form: submits directly to the server action via the `action` prop.
export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-900">Personalize Your Plan</CardTitle>
          <CardDescription>Tell us about yourself so we can calculate your targets.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Server action binding: submitting this form calls completeOnboarding */}
          <form action={completeOnboarding} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" name="age" type="number" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <select name="gender" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input id="weight" name="weight" type="number" step="0.1" placeholder="e.g. 75.5" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input id="height" name="height" type="number" placeholder="e.g. 180" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activityLevel">Activity Level</Label>
              <select name="activityLevel" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="sedentary">Sedentary (Little to no exercise)</option>
                <option value="light">Lightly Active (1-3 days/week)</option>
                <option value="moderate">Moderately Active (3-5 days/week)</option>
                <option value="active">Very Active (6-7 days/week)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal">Your Goal</Label>
              <select name="goal" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-slate-700">
                <option value="lose">Weight Loss</option>
                <option value="maintain">Maintain Weight</option>
                <option value="gain">Muscle Gain</option>
              </select>
            </div>

            <Button type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800">
              Generate My Fitness Plan
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}