'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export function PasswordResetHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Method 1: Handle hash fragments (standard Supabase password reset)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const type = hashParams.get('type')

    if (accessToken && type === 'recovery') {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: hashParams.get('refresh_token') || '',
      }).then(({ error }) => {
        if (!error) {
          window.history.replaceState(null, '', '/reset-password')
          router.refresh()
        } else {
          console.error('Failed to set session from hash:', error)
          router.push(`/login?error=${encodeURIComponent(error.message || 'Invalid reset link')}`)
        }
      })
      return
    }

    // Method 2: If there's a code parameter, check if session was established
    // If session exists, clean up the URL by removing the code parameter
    const code = searchParams.get('code')
    if (code) {
      // Check if we have a session (server-side exchange succeeded)
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          // Session was established - clean up URL by removing code parameter
          const newUrl = new URL(window.location.href)
          newUrl.searchParams.delete('code')
          window.history.replaceState(null, '', newUrl.pathname + newUrl.search)
          router.refresh()
        }
        // If no session, the server-side code will handle the error and redirect
      })
    }
  }, [router, searchParams])

  return null
}

