'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export function PasswordResetHandler() {
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Only handle hash fragments (access_token) - code exchange is handled server-side
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
        }
      })
    }
  }, [router])

  return null
}

