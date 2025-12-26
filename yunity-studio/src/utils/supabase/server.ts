import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Server-side Supabase client factory for server components/actions.
// Wires Supabase auth to Next.js cookies so sessions persist and refresh.
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,    // Supabase project URL
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // Supabase anon key (server-side use here)
    {
      cookies: {
        // Read all incoming cookies for Supabase.
        getAll() { return cookieStore.getAll() },
        // When Supabase wants to set cookies, write them to the response.
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // In some server-component contexts setting cookies may be disallowed; ignore quietly.
          }
        },
      },
    }
  )
}