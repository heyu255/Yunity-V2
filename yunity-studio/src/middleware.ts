import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { createClient } from '@/utils/supabase/server'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()

  // 1. THE SHORT CIRCUIT: If they are on the home page (/), let them through immediately
  if (url.pathname === '/') {
    return await updateSession(request)
  }

  // 2. Refresh the session for other pages
  const response = await updateSession(request)
  
  // 3. Check for a real user session
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 4. PROTECT PROTECTED ROUTES: Only redirect if they are trying to hit dashboard/onboarding
  const isProtectedRoute = url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/onboarding')
  
  if (isProtectedRoute && !user) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 5. REDIRECT LOGGED-IN USERS: If they are already logged in, don't let them see the login page
  if (url.pathname === '/login' && user) {
    url.pathname = '/dashboard/nutrition'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/((?!api/webhooks/stripe|_next/static|_next/image|favicon.ico).*)',
  ],
}
