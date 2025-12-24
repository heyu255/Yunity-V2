import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

function redirectWithCookies(from: NextResponse, to: URL) {
  const redirectResponse = NextResponse.redirect(to)
  from.cookies.getAll().forEach(({ name, value }) => {
    redirectResponse.cookies.set(name, value)
  })
  return redirectResponse
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    supabaseResponse.headers.set('x-user-id', user.id)
  }

  const url = request.nextUrl.clone()
  const isHomePage = url.pathname === '/'
  const isLoginPage = url.pathname.startsWith('/login')
  const isAuthPage = url.pathname.startsWith('/auth')
  const isPublicRoute = isHomePage || isLoginPage || isAuthPage
  const isProtectedRoute =
    url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/onboarding')

  // Unauthenticated: send to login for protected/non-public routes
  if (!user && (isProtectedRoute || !isPublicRoute)) {
    url.pathname = '/login'
    return redirectWithCookies(supabaseResponse, url)
  }

  // Authenticated: keep users out of the login page
  if (user && isLoginPage) {
    url.pathname = '/dashboard/nutrition'
    return redirectWithCookies(supabaseResponse, url)
  }

  return supabaseResponse
}

