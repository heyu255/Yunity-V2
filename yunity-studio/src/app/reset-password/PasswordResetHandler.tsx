'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export function PasswordResetHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const establishSession = async () => {
      // Method 1: Check for hash fragments (Supabase password reset standard)
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const type = hashParams.get('type')

      if (accessToken && type === 'recovery') {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: hashParams.get('refresh_token') || '',
        })

        if (!error) {
          window.history.replaceState(null, '', '/reset-password')
          setIsProcessing(false)
          router.refresh()
          return
        }
      }

      // Method 2: Check for code query parameter
      const code = searchParams.get('code')
      if (code) {
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (!error && data?.session) {
            // Session established successfully
            // Remove code from URL and refresh to get server-side session
            const newUrl = new URL(window.location.href)
            newUrl.searchParams.delete('code')
            window.history.replaceState(null, '', newUrl.pathname + newUrl.search)
            setIsProcessing(false)
            // Refresh to let server see the new session
            router.refresh()
            return
          } else if (error) {
            // Code exchange failed
            setIsProcessing(false)
            router.push(`/login?error=${encodeURIComponent(error.message || 'Invalid or expired reset link')}`)
            return
          }
        } catch (err) {
          console.error('Code exchange error:', err)
          setIsProcessing(false)
          router.push('/login?error=Failed to verify reset link')
          return
        }
      }

      // Method 3: Check if session already exists
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setIsProcessing(false)
        return
      }

      // No code or hash found, and no existing session
      setIsProcessing(false)
    }

    establishSession()
  }, [router, searchParams])

  return null
}

