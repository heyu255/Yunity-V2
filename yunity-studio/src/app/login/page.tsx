import { login, signUp } from './actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Dumbbell, CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      
      {/* LEFT SIDE: Branding & Features (Desktop Only) */}
      <div className="hidden lg:flex bg-slate-900 relative overflow-hidden flex-col justify-between p-16">
        {/* Decorative Background Glows */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
              <Dumbbell size={28} className="text-white" />
            </div>
            <span className="text-3xl font-black tracking-tighter italic uppercase text-white">
              YUNITY
            </span>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <h2 className="text-6xl font-black text-white leading-[1.1] tracking-tight">
            Elevate your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">
              performance.
            </span>
          </h2>
          
          <div className="space-y-5">
            {[
              "Personalized AI Training Architecture",
              "Dynamic Macro & Nutrition Logic",
              "Advanced Progress Tracking & Analytics"
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-4 text-slate-300">
                <div className="bg-indigo-500/10 p-1 rounded-full">
                  <CheckCircle2 size={20} className="text-indigo-400" />
                </div>
                <span className="font-semibold text-lg">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-slate-500 font-medium">
            Join the elite circle of performance-driven athletes.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Auth Form */}
      <div className="flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md space-y-8">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <Dumbbell size={32} className="text-indigo-600" />
              <span className="text-3xl font-black italic uppercase tracking-tighter">YUNITY</span>
            </div>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
            <p className="text-slate-500 font-medium">Access your custom strategy dashboard.</p>
          </div>

          <Card className="border-slate-200 shadow-2xl shadow-slate-200/60 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="pb-4">
              {params?.error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 animate-in fade-in slide-in-from-top-2">
                  <p className="text-sm text-red-600 text-center font-bold">
                    {params.error}
                  </p>
                </div>
              )}
            </CardHeader>
            
            <CardContent>
              <form className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-bold ml-1">Email</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    required 
                    className="h-12 rounded-xl border-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <Label htmlFor="password" className="text-slate-700 font-bold">Password</Label>
                    <button type="button" className="text-xs font-bold text-indigo-600 hover:text-indigo-500">
                      Forgot?
                    </button>
                  </div>
                  <Input 
                    id="password" 
                    name="password" 
                    type="password" 
                    required 
                    className="h-12 rounded-xl border-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <Button 
                    formAction={login} 
                    className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 group transition-all"
                  >
                    Log In
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Button>
                  
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-bold">New to Yunity?</span></div>
                  </div>

                  <Button 
                    formAction={signUp} 
                    variant="outline" 
                    className="h-12 border-slate-200 hover:bg-slate-50 font-bold rounded-xl text-slate-700 transition-all"
                  >
                    Create Account
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <footer className="text-center text-xs text-slate-400 px-6 leading-relaxed">
            By signing in, you agree to our{" "}
            <Link href="#" className="underline hover:text-indigo-600">Terms</Link> and{" "}
            <Link href="#" className="underline hover:text-indigo-600">Privacy Policy</Link>.
          </footer>
        </div>
      </div>
    </div>
  )
}