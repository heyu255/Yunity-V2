/**
 * Script to measure API call reduction from middleware session management
 * 
 * This simulates the difference between:
 * - WITH middleware: Session refreshed once, shared across routes
 * - WITHOUT middleware: Each route calls getUser() independently
 */

// Count of routes that call getUser()
const routesWithAuth = [
  '/dashboard/nutrition',
  '/dashboard/fitness', 
  '/dashboard/account',
  '/dashboard/fitness/workout/[id]',
  '/dashboard/nutrition/meal-plan/[id]',
  '/dashboard/layout', // Layout also calls getUser
  '/onboarding',
  '/auth/callback',
  // Server actions that call getUser
  'generateMealPlan',
  'generateWorkoutPlan', 
  'updateProfile',
  'completeOnboarding',
  'createCheckoutSession',
  'createPortalSession'
]

// Count of server actions that call getUser()
const serverActionsWithAuth = [
  'generateMealPlan',
  'generateWorkoutPlan',
  'updateProfile',
  'completeOnboarding',
  'createCheckoutSession',
  'createPortalSession'
]

function calculateApiCalls(scenario) {
  let totalCalls = 0
  
  if (scenario === 'without_middleware') {
    // Without middleware: Each route needs to check auth independently
    // Each route calls getUser() which may trigger session refresh
    // In a typical user session navigating 3-4 pages:
    const pagesVisited = 4 // Typical session: nutrition, fitness, account, workout detail
    const actionsTriggered = 2 // Typical: generate meal plan, update profile
    
    // Each page/action calls getUser() independently
    // Each getUser() may need to refresh session = 1 API call each
    totalCalls = (pagesVisited * 1) + (actionsTriggered * 1)
    
    // Plus: Each route might need to fetch user profile separately
    // (Some routes fetch profile after getUser)
    const profileFetches = pagesVisited * 0.5 // 50% of pages also fetch profile
    totalCalls += profileFetches
    
    return {
      getUserCalls: pagesVisited + actionsTriggered,
      profileFetches: profileFetches,
      total: totalCalls,
      scenario: 'Without Middleware'
    }
  } else {
    // With middleware: Session refreshed ONCE in middleware
    // All subsequent getUser() calls use the refreshed session from cookies
    const pagesVisited = 4
    const actionsTriggered = 2
    
    // Middleware refreshes session once = 1 API call
    const middlewareRefresh = 1
    
    // Subsequent getUser() calls use cached session (no API call)
    // Profile fetches still happen but session is already valid
    const profileFetches = pagesVisited * 0.5
    
    totalCalls = middlewareRefresh + profileFetches
    
    return {
      middlewareRefresh: middlewareRefresh,
      getUserCalls: 0, // No additional getUser API calls (uses cached)
      profileFetches: profileFetches,
      total: totalCalls,
      scenario: 'With Middleware'
    }
  }
}

function calculateReduction() {
  const without = calculateApiCalls('without_middleware')
  const withMiddleware = calculateApiCalls('with_middleware')
  
  const reduction = ((without.total - withMiddleware.total) / without.total) * 100
  
  return {
    withoutMiddleware: without,
    withMiddleware: withMiddleware,
    reduction: reduction,
    callsSaved: without.total - withMiddleware.total
  }
}

// Run calculation
const results = calculateReduction()

console.log('='.repeat(60))
console.log('API Call Reduction Analysis')
console.log('='.repeat(60))
console.log('\n📊 Scenario: User navigating 4 pages + 2 server actions')
console.log('\n❌ WITHOUT Middleware:')
console.log(`   - getUser() calls: ${results.withoutMiddleware.getUserCalls}`)
console.log(`   - Profile fetches: ${results.withoutMiddleware.profileFetches.toFixed(1)}`)
console.log(`   - Total API calls: ${results.withoutMiddleware.total}`)

console.log('\n✅ WITH Middleware:')
console.log(`   - Middleware refresh: ${results.withMiddleware.middlewareRefresh}`)
console.log(`   - getUser() calls (cached): ${results.withMiddleware.getUserCalls}`)
console.log(`   - Profile fetches: ${results.withMiddleware.profileFetches.toFixed(1)}`)
console.log(`   - Total API calls: ${results.withMiddleware.total}`)

console.log('\n📈 Results:')
console.log(`   - API calls saved: ${results.callsSaved}`)
console.log(`   - Reduction: ${results.reduction.toFixed(1)}%`)

// More realistic calculation with session refresh frequency
console.log('\n' + '='.repeat(60))
console.log('Realistic Scenario (with session refresh)')
console.log('='.repeat(60))

// Supabase sessions refresh every ~1 hour
// In a typical session, user might navigate 4-5 pages
// Without middleware: Each page checks if session needs refresh = potential API calls
// With middleware: One refresh check, then all pages use cached session

function realisticCalculation() {
  const pagesInSession = 5
  const actionsInSession = 3
  
  // Without middleware: Each route independently checks session
  // If session is close to expiry, each might trigger refresh check
  const withoutMiddleware = {
    sessionChecks: pagesInSession + actionsInSession, // Each route checks
    potentialRefreshes: Math.ceil((pagesInSession + actionsInSession) * 0.3), // 30% might need refresh
    total: pagesInSession + actionsInSession + Math.ceil((pagesInSession + actionsInSession) * 0.3)
  }
  
  // With middleware: One check, all routes benefit
  const withMiddleware = {
    sessionCheck: 1, // Middleware checks once
    potentialRefresh: 1, // Only one refresh if needed
    total: 2 // Max 2 API calls (check + refresh if needed)
  }
  
  const reduction = ((withoutMiddleware.total - withMiddleware.total) / withoutMiddleware.total) * 100
  
  return {
    without: withoutMiddleware,
    with: withMiddleware,
    reduction: reduction,
    saved: withoutMiddleware.total - withMiddleware.total
  }
}

const realistic = realisticCalculation()

console.log('\n❌ WITHOUT Middleware:')
console.log(`   - Session checks: ${realistic.without.sessionChecks}`)
console.log(`   - Potential refreshes: ${realistic.without.potentialRefreshes}`)
console.log(`   - Total: ${realistic.without.total} API calls`)

console.log('\n✅ WITH Middleware:')
console.log(`   - Session check: ${realistic.with.sessionCheck}`)
console.log(`   - Potential refresh: ${realistic.with.potentialRefresh}`)
console.log(`   - Total: ${realistic.with.total} API calls`)

console.log('\n📈 Results:')
console.log(`   - API calls saved: ${realistic.saved}`)
console.log(`   - Reduction: ${realistic.reduction.toFixed(1)}%`)

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { calculateReduction, realisticCalculation }
}

