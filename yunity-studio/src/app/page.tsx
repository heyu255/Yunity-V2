import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle2, Zap, Shield, Sparkles } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const params = await searchParams
  
  // Handle password reset code from Supabase email
  // If code is present, redirect to reset-password with the code so client can handle it
  if (params?.code) {
    // Redirect to reset-password with the code parameter
    // The client component will exchange it for a session
    redirect(`/reset-password?code=${params.code}`)
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* --- NAVIGATION --- */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Zap className="text-white" size={20} fill="currentColor" />
          </div>
          <span className="text-xl font-bold tracking-tight">Yunity<span className="text-blue-600">Studio</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="#features" className="hover:text-blue-600 transition-colors">Features</Link>
          <Link href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</Link>
          <Link href="/login" className="hover:text-blue-600 transition-colors">Log In</Link>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 rounded-full px-6">
            <Link href="/login">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60" />
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-indigo-50 rounded-full blur-[100px] opacity-60" />
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full mb-8 animate-fade-in">
            <Sparkles size={14} className="text-blue-600" />
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">AI-Powered Fitness is here</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
            Your Personal Trainer, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
              Reimagined with AI.
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 mb-10 leading-relaxed">
            Stop guessing your macros and workouts. Yunity Studio builds custom 7-day performance splits and nutrition targets tailored to your DNA and goals.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 h-14 px-8 text-lg rounded-full shadow-xl shadow-blue-200 transition-all hover:scale-105">
              <Link href="/login">
                Start Your Transformation <ArrowRight className="ml-2" size={20} />
              </Link>
            </Button>
            <Button variant="ghost" size="lg" className="h-14 px-8 text-lg rounded-full text-slate-600">
              View Sample Plan
            </Button>
          </div>

          {/* Social Proof / Trust Badges */}
          <div className="mt-16 flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale">
             <div className="font-bold text-xl text-slate-400 italic underline decoration-blue-500">STRIPE SECURE</div>
             <div className="font-bold text-xl text-slate-400 uppercase tracking-tighter">OpenAI Intelligence</div>
             <div className="font-bold text-xl text-slate-400">SUPABASE DB</div>
          </div>
        </div>
      </section>
      {/* --- FEATURES SECTION --- */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Precision Engineering for your Body</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Everything you need to hit your goals, powered by the most advanced AI models on earth.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                title: "AI Workout Architect", 
                desc: "Get 7-day splits with exact sets, reps, and rest times. No more generic PDF plans.",
                icon: <Zap className="text-blue-600" /> 
              },
              { 
                title: "Dynamic Nutrition", 
                desc: "We calculate your TDEE and macros in real-time. Change your goal, and the plan pivots instantly.",
                icon: <Sparkles className="text-blue-600" /> 
              },
              { 
                title: "Premium Analysis", 
                desc: "Access specialized training strategies for weight loss, muscle gain, or pure maintenance.",
                icon: <Shield className="text-blue-600" /> 
              }
            ].map((f, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all hover:shadow-xl group">
                <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* --- PRICING SECTION --- */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Simple, Results-Driven Pricing
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-lg">
              Start for free to track your metrics, or upgrade to let AI architect your entire performance plan.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* --- FREE PLAN --- */}
            <div className="p-10 rounded-3xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col">
              <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">Basic Access</h3>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-5xl font-extrabold text-slate-900">$0</span>
                <span className="text-slate-500 font-medium">/month</span>
              </div>
              
              <ul className="space-y-5 mb-10 flex-grow">
                {[
                  'TDEE & Macro Calculation',
                  'Basic Nutrition Tracking',
                  'Community Dashboard Access',
                  'Profile Management'
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-slate-600">
                    <CheckCircle2 size={20} className="text-slate-300" /> 
                    <span className="text-sm font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              
              <Button asChild variant="outline" className="w-full h-14 rounded-2xl border-slate-200 text-slate-700 hover:bg-slate-50 text-lg">
                <Link href="/login">Get Started Free</Link>
              </Button>
            </div>

            {/* --- PREMIUM PLAN --- */}
            <div className="p-10 rounded-3xl border-2 border-blue-600 bg-white shadow-2xl shadow-blue-100 relative flex flex-col transform hover:-translate-y-1 transition-all">
              <div className="absolute top-0 right-10 bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-b-xl uppercase tracking-widest">
                Recommended
              </div>
              
              <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">Premium Architect</h3>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-5xl font-extrabold text-slate-900">$9</span>
                <span className="text-slate-500 font-medium">/month</span>
              </div>
              
              <ul className="space-y-5 mb-10 flex-grow">
                {[
                  'Everything in Free Plan',
                  'AI-Generated 7-Day Workout Splits',
                  'Customized Nutrition Blueprints',
                  'Advanced AI Training Analysis',
                  'Priority Model Access (OpenAI)',
                  'Early Access to New Features'
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-slate-800">
                    <CheckCircle2 size={20} className="text-blue-600" /> 
                    <span className="text-sm font-bold">{item}</span>
                  </li>
                ))}
              </ul>
              
              <Button asChild className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 text-lg font-bold">
                <Link href="/login">Unlock Premium Architect</Link>
              </Button>
            </div>

          </div>

          <div className="mt-16 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Shield size={16} />
              <span className="text-xs font-semibold uppercase tracking-widest">Secure Payments via Stripe</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}