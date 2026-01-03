import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

// Build a redirect response and carry forward any cookies Supabase set,
// so the session stays intact across redirects.
function redirectWithCookies(from: NextResponse, to: URL) {
  const redirectResponse = NextResponse.redirect(to)
  from.cookies.getAll().forEach(({ name, value }) => {
    redirectResponse.cookies.set(name, value)
  })
  return redirectResponse
}

// Centralized auth/session middleware used by src/middleware.ts
export async function updateSession(request: NextRequest) {
  // Base response that may be replaced if Supabase sets cookies.
  let supabaseResponse = NextResponse.next({ request })

  // Create a Supabase server client bound to this request's cookies.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Write cookies back to the request, then mirror them to the response.
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value }) =>
            supabaseResponse.cookies.set(name, value)
          )
        },
      },
    }
  )

  // Resolve the current user (may be null).
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Expose user id to downstream handlers if present.
  if (user) {
    supabaseResponse.headers.set('x-user-id', user.id)
  }

  const url = request.nextUrl.clone()
  const isHomePage = url.pathname === '/'
  const isLoginPage = url.pathname.startsWith('/login')
  const isAuthPage = url.pathname.startsWith('/auth')
  const isResetPasswordPage = url.pathname.startsWith('/reset-password')
  const isPublicRoute = isHomePage || isLoginPage || isAuthPage || isResetPasswordPage
  const isProtectedRoute =
    url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/onboarding')

  // Unauthenticated: send to login for protected or any non-public routes.
  if (!user && (isProtectedRoute || !isPublicRoute)) {
    url.pathname = '/login'
    return redirectWithCookies(supabaseResponse, url)
  }

  // Authenticated: keep logged-in users away from the login page.
  if (user && isLoginPage) {
    url.pathname = '/dashboard/nutrition'
    return redirectWithCookies(supabaseResponse, url)
  }

  // Otherwise, continue with the (possibly cookie-updated) response.
  return supabaseResponse
}

