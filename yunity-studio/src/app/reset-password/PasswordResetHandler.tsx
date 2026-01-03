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

    // Method 2: If there's a code parameter, the page will reload after server-side exchange
    // Just wait for the server to handle it - don't try to exchange client-side
    // as it will fail with PKCE errors
    const code = searchParams.get('code')
    if (code) {
      // Server-side exchange should handle this, but if we're still here,
      // it means the server exchange failed. The server will redirect with an error.
      // We don't need to do anything here - the server-side code will handle it.
    }
  }, [router, searchParams])

  return null
}

