import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Welcome, {user.email}</h1>
      <p className="text-muted-foreground">Your Yunity Studio journey starts here.</p>
      {/* This is where we will build the Fitness Tracker tomorrow */}
    </div>
  )
}