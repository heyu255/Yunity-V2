import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/login/actions'
import { updateProfile } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LogOut, User, Ruler, Weight, Target, Activity, TrendingUp } from 'lucide-react'
import SubmitButton from '@/components/SubmitButton'
import { createCustomerPortalSession } from '@/app/actions/stripe-portal'
import WeightTrendChart from './weight-trend-chart'

// Force the page to always fetch fresh data
export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: weightEntries } = await supabase
    .from('weight_entries')
    .select('weight, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(365)

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-10">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Account Settings</h1>
        <form action={logout}>
          <Button variant="ghost" className="text-slate-500 hover:text-red-600 transition-colors w-full sm:w-auto">
            <LogOut size={18} className="mr-2" /> Sign Out
          </Button>
        </form>
      </header>

      <form action={updateProfile}>
        <Card className="shadow-md border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <User size={20} /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-500">Email Address</Label>
                <Input value={user.email} disabled className="bg-slate-100 border-slate-200 cursor-not-allowed" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-500">Subscription Status</Label>
                <div className="rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                  {profile?.is_premium ? '🌟 Premium Member' : 'Free Tier'}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t space-y-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                Your Measurements
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-slate-600">
                    <Weight size={16} className="text-slate-500" /> Weight (kg)
                  </Label>
                  {/* Changed name to weight_kg */}
                  <Input name="weight_kg" type="number" step="0.1" defaultValue={profile?.weight_kg} className="focus:ring-slate-400" />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-slate-600">
                    <Ruler size={16} className="text-slate-500" /> Height (cm)
                  </Label>
                  {/* Changed name to height_cm */}
                  <Input name="height_cm" type="number" defaultValue={profile?.height_cm} className="focus:ring-slate-400" />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-slate-600">
                    <Activity size={16} className="text-slate-500" /> Activity Level
                  </Label>
                  <select 
                    name="activity_level" 
                    defaultValue={profile?.activity_level}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400"
                  >
                    <option value="sedentary">Sedentary</option>
                    <option value="light">Lightly Active</option>
                    <option value="moderate">Moderately Active</option>
                    <option value="active">Very Active</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-slate-600">
                    <Target size={16} className="text-slate-500" /> Your Goal
                  </Label>
                  <select 
                    name="goal" 
                    defaultValue={profile?.goal}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400"
                  >
                    <option value="lose">Weight Loss</option>
                    <option value="maintain">Maintain Weight</option>
                    <option value="gain">Muscle Gain</option>
                  </select>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic mt-2">
                Note: Updating these will automatically recalculate your TDEE and AI plans.
              </p>

              <SubmitButton className="h-12 w-full bg-slate-900 text-lg font-semibold text-white transition-all hover:bg-slate-800 active:scale-[0.98]">
                Save Changes
              </SubmitButton>

            </div>
          </CardContent>
        </Card>
      </form>
      {profile?.is_premium && (
  <Card className="shadow-md border-slate-200 overflow-hidden">
    <CardHeader className="bg-slate-50/50 border-b">
      <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider">
        Billing & Subscription
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <p className="font-semibold text-slate-900">Manage your plan</p>
        <p className="text-sm text-slate-500">Update payment methods or cancel your subscription.</p>
      </div>
      <form action={createCustomerPortalSession}>
        <Button
          type="submit"
          variant="outline"
          className="border-slate-300 hover:bg-slate-50 font-semibold w-full sm:w-auto"
        >
          Open Stripe Portal
        </Button>
      </form>
    </CardContent>
  </Card>
)}
      <Card className="shadow-md border-slate-200">
        <CardHeader className="bg-slate-50/50 border-b">
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <TrendingUp size={20} /> Weight Progress Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <WeightTrendChart
            entries={(weightEntries ?? []) as Array<{ weight: number; created_at: string }>}
            goal={profile?.goal}
          />
        </CardContent>
      </Card>
    </div>
  )
}