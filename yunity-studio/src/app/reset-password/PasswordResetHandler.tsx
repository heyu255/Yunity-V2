'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export function PasswordResetHandler() {
  const router = useRouter()

  useEffect(() => {
    // Check for hash fragments in the URL (Supabase password reset uses these)
    if (typeof window !== 'undefined') {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const type = hashParams.get('type')

      // If we have a password reset token in the hash
      if (accessToken && type === 'recovery') {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // Set the session from the hash fragment
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: hashParams.get('refresh_token') || '',
        }).then(({ error }) => {
          if (!error) {
            // Clear the hash and redirect
            window.history.replaceState(null, '', '/reset-password')
            router.refresh()
          }
        })
      }
    }
  }, [router])

  return null
}

