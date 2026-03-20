import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/reset-password'
  const error_description = requestUrl.searchParams.get('error_description')
  const error = requestUrl.searchParams.get('error')

  // Check for errors from Supabase
  if (error || error_description) {
    console.error('Auth callback error:', { error, error_description })
    const loginUrl = new URL('/login', requestUrl.origin)
    loginUrl.searchParams.set('error', error_description || error || 'Authentication failed')
    return NextResponse.redirect(loginUrl)
  }

  // If there's a code, exchange it for a session
  if (code) {
    const supabase = await createClient()
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Auth callback code exchange error:', exchangeError.message)
      const errorUrl = new URL('/login', requestUrl.origin)
      errorUrl.searchParams.set('error', 'Link expired or already used. Please request a new password reset.')
      return NextResponse.redirect(errorUrl)
    }

    if (data?.session) {
      // Session established successfully - verify user exists
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Redirect to the next URL (reset-password)
        const redirectUrl = new URL(next, requestUrl.origin)
        return NextResponse.redirect(redirectUrl)
      } else {
        // Session exists but no user
        const errorUrl = new URL('/login', requestUrl.origin)
        errorUrl.searchParams.set('error', 'Failed to establish session')
        return NextResponse.redirect(errorUrl)
      }
    }
  }

  // If no code or exchange failed, redirect to login
  const loginUrl = new URL('/login', requestUrl.origin)
  loginUrl.searchParams.set('error', 'Invalid or expired reset link')
  return NextResponse.redirect(loginUrl)
}

