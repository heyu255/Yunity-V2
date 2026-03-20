'use client'

import { useState, useTransition } from 'react'
import { login, signUp } from './actions'
import { createBrowserClient } from '@supabase/ssr'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowRight, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

function PasswordInput({ name, placeholder, value, onChange }: {
  name: string
  placeholder?: string
  value: string
  onChange: (v: string) => void
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Input
        name={name}
        type={show ? 'text' : 'password'}
        placeholder={placeholder ?? '••••••••'}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="h-12 rounded-xl border-slate-200 bg-slate-50 pr-10 focus:ring-2 focus:ring-slate-400"
        required
      />
      <button
        type="button"
        onClick={() => setShow(v => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
        tabIndex={-1}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  )
}

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null
  const checks = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'Contains a number', ok: /\d/.test(password) },
    { label: 'Contains a letter', ok: /[a-zA-Z]/.test(password) },
  ]
  return (
    <div className="space-y-1 pt-1">
      {checks.map(c => (
        <div key={c.label} className={`flex items-center gap-1.5 text-[11px] transition-colors ${c.ok ? 'text-emerald-600' : 'text-slate-400'}`}>
          <CheckCircle2 size={11} className={c.ok ? 'text-emerald-500' : 'text-slate-300'} />
          {c.label}
        </div>
      ))}
    </div>
  )
}

export function LoginForm({
  serverError,
  serverMessage,
  defaultTab = 'signin',
}: {
  serverError?: string
  serverMessage?: string
  defaultTab?: 'signin' | 'signup'
}) {
  const [tab, setTab] = useState<'signin' | 'signup'>(defaultTab)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [localError, setLocalError] = useState('')
  const [forgotSent, setForgotSent] = useState(false)
  const [isPending, startTransition] = useTransition()

  const error = localError || serverError

  function switchTab(t: 'signin' | 'signup') {
    setTab(t)
    setLocalError('')
    setForgotSent(false)
    setPassword('')
    setConfirm('')
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLocalError('')

    const formData = new FormData(e.currentTarget)

    if (tab === 'signup') {
      if (password.length < 8) {
        setLocalError('Password must be at least 8 characters.')
        return
      }
      if (password !== confirm) {
        setLocalError('Passwords do not match.')
        return
      }
      startTransition(() => signUp(formData))
    } else {
      if (!email || !password) {
        setLocalError('Please enter your email and password.')
        return
      }
      startTransition(() => login(formData))
    }
  }

  function handleForgot(e: React.MouseEvent) {
    e.preventDefault()
    if (!email) {
      setLocalError('Enter your email address first, then click Forgot password.')
      return
    }
    startTransition(async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const baseUrl = window.location.origin
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${baseUrl}/auth/callback?next=/reset-password`,
      })
      if (error) {
        setLocalError(error.message)
      } else {
        // Show success inline without redirect
        setLocalError('')
        // Reuse serverMessage slot via a synthetic success — we'll use a local state instead
        setForgotSent(true)
      }
    })
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Tab switcher */}
      <div className="flex rounded-2xl border border-slate-200 bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => switchTab('signin')}
          className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
            tab === 'signin'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => switchTab('signup')}
          className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
            tab === 'signup'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Header text */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {tab === 'signin' ? 'Welcome back' : 'Start your free trial'}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {tab === 'signin'
            ? 'Sign in to continue your plan.'
            : '7 days free — no credit card required.'}
        </p>
      </div>

      {/* Error / success messages */}
      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}
      {!error && (serverMessage || forgotSent) && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-600">
          {forgotSent ? 'Password reset link sent. Check your inbox and spam folder.' : serverMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-slate-700">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="h-12 rounded-xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-slate-400"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-slate-700">Password</Label>
            {tab === 'signin' && (
              <button
                type="button"
                onClick={handleForgot}
                className="text-xs text-slate-500 hover:text-slate-900 transition-colors"
              >
                Forgot password?
              </button>
            )}
          </div>
          <PasswordInput name="password" value={password} onChange={setPassword} />
          {tab === 'signup' && <PasswordStrength password={password} />}
        </div>

        {/* Confirm password — signup only */}
        {tab === 'signup' && (
          <div className="space-y-1.5">
            <Label htmlFor="confirm_password" className="text-slate-700">Confirm password</Label>
            <PasswordInput
              name="confirm_password"
              placeholder="Re-enter your password"
              value={confirm}
              onChange={setConfirm}
            />
            {confirm && confirm !== password && (
              <p className="text-[11px] text-red-500 font-medium">Passwords don't match</p>
            )}
            {confirm && confirm === password && password.length >= 8 && (
              <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 size={11} /> Looks good
              </p>
            )}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-bold text-white transition-all hover:bg-slate-800 disabled:opacity-60 mt-2"
        >
          {isPending ? (
            <><Loader2 size={16} className="animate-spin" /> {tab === 'signin' ? 'Signing in…' : 'Creating account…'}</>
          ) : (
            <>{tab === 'signin' ? 'Sign In' : 'Create Account'} <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" /></>
          )}
        </button>
      </form>

      {/* Switch tab hint */}
      <p className="text-center text-xs text-slate-400">
        {tab === 'signin' ? (
          <>Don't have an account?{' '}
            <button type="button" onClick={() => switchTab('signup')} className="font-semibold text-slate-700 hover:text-slate-900 underline underline-offset-2">
              Create one free
            </button>
          </>
        ) : (
          <>Already have an account?{' '}
            <button type="button" onClick={() => switchTab('signin')} className="font-semibold text-slate-700 hover:text-slate-900 underline underline-offset-2">
              Sign in
            </button>
          </>
        )}
      </p>
    </div>
  )
}
