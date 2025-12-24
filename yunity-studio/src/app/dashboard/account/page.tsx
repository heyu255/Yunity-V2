import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/login/actions'
import { updateProfile } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LogOut, User, Ruler, Weight, Target, Activity } from 'lucide-react'
import SubmitButton from '@/components/SubmitButton'

// Force the page to always fetch fresh data
export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').single()

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-10">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
        <form action={logout}>
          <Button variant="ghost" className="text-slate-500 hover:text-red-600 transition-colors">
            <LogOut size={18} className="mr-2" /> Sign Out
          </Button>
        </form>
      </header>

      <form action={updateProfile}>
        <Card className="shadow-md border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="flex items-center gap-2 text-blue-600">
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
                <div className="px-3 py-2 rounded-md border border-blue-100 bg-blue-50 font-bold text-sm text-blue-700">
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
                    <Weight size={16} className="text-blue-500" /> Weight (kg)
                  </Label>
                  {/* Changed name to weight_kg */}
                  <Input name="weight_kg" type="number" step="0.1" defaultValue={profile?.weight_kg} className="focus:ring-blue-500" />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-slate-600">
                    <Ruler size={16} className="text-blue-500" /> Height (cm)
                  </Label>
                  {/* Changed name to height_cm */}
                  <Input name="height_cm" type="number" defaultValue={profile?.height_cm} className="focus:ring-blue-500" />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-slate-600">
                    <Activity size={16} className="text-blue-500" /> Activity Level
                  </Label>
                  <select 
                    name="activity_level" 
                    defaultValue={profile?.activity_level}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="sedentary">Sedentary</option>
                    <option value="light">Lightly Active</option>
                    <option value="moderate">Moderately Active</option>
                    <option value="active">Very Active</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-slate-600">
                    <Target size={16} className="text-blue-500" /> Your Goal
                  </Label>
                  <select 
                    name="goal" 
                    defaultValue={profile?.goal}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
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

              <SubmitButton className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg font-semibold shadow-lg shadow-blue-100 transition-all active:scale-[0.98]">
                Save Changes
              </SubmitButton>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}