import { createBrowserClient } from '@supabase/ssr'

// This replaces the old createClientComponentClient
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)