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

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    console.error('Signup Error:', error.message)
    redirect('/login?error=Registration failed')
  }

  // After signup, user usually needs to check email or can be auto-logged in
  // For your dev flow, redirecting to onboarding is common
  redirect('/onboarding')
}
export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}