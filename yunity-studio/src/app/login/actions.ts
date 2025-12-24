'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Login Error:', error.message)
    // We redirect back to login with a search param to show an error if needed
    redirect('/login?error=Invalid credentials')
  }

  // Success: Redirect to Nutrition dashboard
  redirect('/dashboard/nutrition')
}

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  console.log("🚀 SIGNUP ATTEMPT STARTED:", { email }); // Log to Vercel

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Ensure Supabase knows where to send the user back to
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    console.error("❌ SUPABASE SIGNUP ERROR:", error.message);
    console.error("DEBUG INFO:", { 
      status: error.status, 
      code: error.code 
    });
    
    // Redirect with the SPECIFIC error message so the user knows what happened
    return redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  if (data?.user && data.session === null) {
    console.log("✉️ USER CREATED BUT UNCONFIRMED. Check email.");
    return redirect('/login?message=Check your email to confirm your account')
  }

  console.log("✅ SIGNUP SUCCESSFUL:", data.user?.id);
  if (data?.user) {
    console.log("✅ User created. Redirecting to onboarding.");
    return redirect('/onboarding');
  }
}
export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}