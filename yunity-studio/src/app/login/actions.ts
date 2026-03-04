'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

async function authUserExists(email: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Server is missing Supabase admin configuration.')
  }

  const adminClient = createSupabaseClient(supabaseUrl, serviceRoleKey)
  const normalizedEmail = email.trim().toLowerCase()

  const { data: exactMatch, error: directLookupError } = await adminClient
    .schema('auth')
    .from('users')
    .select('id')
    .eq('email', normalizedEmail)
    .limit(1)

  if (!directLookupError) {
    return (exactMatch?.length ?? 0) > 0
  }

  console.warn('Direct auth.users lookup failed, falling back to paginated listUsers.', directLookupError.message)

  let page = 1
  const perPage = 200

  while (page <= 10) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage })
    if (error) throw error

    const users = data?.users ?? []
    if (users.some((user) => user.email?.toLowerCase() === normalizedEmail)) {
      return true
    }

    if (users.length < perPage) break
    page += 1
  }

  return false
}

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

export async function forgotPassword(formData: FormData) {
  const email = (formData.get('email') as string)?.trim()
  const supabase = await createClient()

  if (!email) {
    return redirect('/login?error=Please enter your email address first')
  }

  let exists = false
  try {
    exists = await authUserExists(email)
  } catch (error) {
    // Next.js redirects are thrown internally; never convert them to UI error text.
    if (
      typeof error === 'object' &&
      error !== null &&
      'digest' in error &&
      typeof (error as { digest?: unknown }).digest === 'string' &&
      (error as { digest: string }).digest.startsWith('NEXT_REDIRECT')
    ) {
      throw error
    }

    return redirect('/login?error=Unable to verify account right now. Please try again.')
  }

  if (!exists) {
    return redirect('/login?error=No account found for this email. Please register first.')
  }
  
  // Use the correct base URL (check both env vars for compatibility)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // Redirect to callback route which will handle code exchange and then redirect to reset-password
    redirectTo: `${baseUrl}/auth/callback?next=/reset-password`,
  })

  if (error) {
    console.error('Password Reset Error:', error.message)
    return redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  return redirect('/login?message=Password reset link sent. Check your inbox and spam folder.')
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