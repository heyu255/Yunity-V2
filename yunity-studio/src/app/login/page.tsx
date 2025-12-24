import { login, signUp } from './actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

// 1. Notice the 'async' keyword and the type update
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  // 2. You MUST await searchParams in Next.js 15
  const params = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Enter your email to sign in to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* 3. Use the awaited 'params' instead of 'searchParams' */}
          {params?.error && (
            <div className="mb-4 p-3 rounded bg-red-50 border border-red-200">
              <p className="text-sm text-red-600 text-center font-medium">
                {params.error}
              </p>
            </div>
          )}

          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <div className="flex gap-4 pt-2">
              <Button formAction={login} className="flex-1 bg-blue-600 hover:bg-blue-700">
                Log In
              </Button>
              <Button formAction={signUp} variant="outline" className="flex-1">
                Sign Up
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}