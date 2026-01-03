import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Dumbbell } from 'lucide-react'
import { PasswordResetHandler } from './PasswordResetHandler'

async function resetPassword(formData: FormData) {
  'use server'
  
  const supabase = await createClient()
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
    redirect('/reset-password?error=Passwords do not match')
  }

  if (password.length < 6) {
    redirect('/reset-password?error=Password must be at least 6 characters')
  }

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    redirect(`/reset-password?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/login?message=Password reset successfully! You can now log in.')
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; code?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  
  // Check if user has a valid session (from the reset link)
  // Note: Session might be established client-side via hash fragments or code exchange
  const { data: { user } } = await supabase.auth.getUser()
  
  // If there's a code parameter and no user, we need to handle it
  // NOTE: Supabase password reset SHOULD use hash fragments (#access_token=...&type=recovery)
  // If you're getting ?code=... instead, your Supabase project is misconfigured
  // Password reset doesn't support PKCE, so code-based flows will fail
  if (params?.code && !user) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(params.code)
    
    // Log the full response for debugging
    console.error('Password reset code exchange result:', {
      hasError: !!error,
      errorMessage: error?.message,
      errorStatus: error?.status,
      errorCode: error?.code,
      hasSession: !!data?.session,
      hasUser: !!data?.user
    })
    
    if (error) {
      // If it's a PKCE error, the code verifier isn't available
      // This means Supabase is configured to use PKCE but password reset doesn't support it
      if (error.message?.includes('PKCE') || error.message?.includes('code verifier')) {
        redirect('/login?error=Password reset links must use hash fragments (#access_token), not query codes. Please configure Supabase to use hash fragments for password reset.')
      } else {
        redirect(`/login?error=${encodeURIComponent(error.message || 'Invalid or expired reset link')}`)
      }
    }
    
    if (!data?.session) {
      // No session returned - this shouldn't happen if exchange succeeded
      // But it can happen if Supabase is misconfigured
      console.error('Code exchange succeeded but no session returned. This indicates a Supabase configuration issue.')
      redirect('/login?error=Failed to verify reset link. Your Supabase project may be misconfigured. Password reset should use hash fragments (#access_token), not query codes (?code=).')
    }
    
    // Session established successfully - verify user exists
    const { data: { user: newUser } } = await supabase.auth.getUser()
    
    if (!newUser) {
      redirect('/login?error=Failed to establish session')
    }
    // If newUser exists, continue rendering the page normally
    // The session is now established and the form will be enabled
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <PasswordResetHandler />
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <Dumbbell size={32} className="text-indigo-600" />
            <span className="text-3xl font-black italic uppercase tracking-tighter">YUNITY</span>
          </div>
        </div>

        <Card className="border-slate-200 shadow-2xl shadow-slate-200/60 rounded-3xl overflow-hidden bg-white">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-slate-900">Reset Password</CardTitle>
            {params?.error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 mt-4">
                <p className="text-sm text-red-600 text-center font-bold">
                  {params.error}
                </p>
              </div>
            )}
            {!user && !params?.error && params?.code && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 mt-4">
                <p className="text-sm text-blue-600 text-center font-bold">
                  Verifying reset link... Please wait a moment.
                </p>
              </div>
            )}
          </CardHeader>
          
          <CardContent>
            <form action={resetPassword} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-bold ml-1">New Password</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                  minLength={6}
                  className="h-12 rounded-xl border-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-700 font-bold ml-1">Confirm Password</Label>
                <Input 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  type="password" 
                  required 
                  minLength={6}
                  className="h-12 rounded-xl border-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <Button 
                type="submit"
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100"
              >
                Reset Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

