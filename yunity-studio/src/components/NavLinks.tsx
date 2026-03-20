'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Utensils, Dumbbell, TrendingUp, User } from 'lucide-react'
import { LogoutButton } from '@/components/LogoutButton'

function useNavItems() {
  const t = useTranslations('nav')
  return [
    { href: '/dashboard/nutrition', icon: Utensils, label: t('nutrition'), color: 'text-orange-400' },
    { href: '/dashboard/fitness', icon: Dumbbell, label: t('fitness'), color: 'text-emerald-400' },
    { href: '/dashboard/fitness/history', icon: TrendingUp, label: t('progress'), color: 'text-violet-400' },
  ]
}

function isActive(href: string, path: string): boolean {
  if (href === '/dashboard/fitness') {
    return path === '/dashboard/fitness' ||
      (path.startsWith('/dashboard/fitness/') && !path.startsWith('/dashboard/fitness/history'))
  }
  return path === href || path.startsWith(href + '/')
}

export function SidebarNav({ initials }: { initials: string }) {
  const path = usePathname()
  const t = useTranslations('nav')
  const navItems = useNavItems()

  return (
    <>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label, color }) => {
          const active = isActive(href, path)
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition-all ${
                active
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon
                size={18}
                className={active ? color : 'text-slate-400 group-hover:text-slate-600 transition-colors'}
              />
              <span className="text-sm">{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto border-t border-slate-100 bg-slate-50/50 p-4 space-y-1">
        <Link
          href="/dashboard/account"
          className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition-all ${
            path.startsWith('/dashboard/account')
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold transition-colors ${
            path.startsWith('/dashboard/account')
              ? 'bg-white/20 text-white'
              : 'bg-slate-200 text-slate-700 group-hover:bg-slate-300'
          }`}>
            {initials}
          </div>
          <span className="text-sm">{t('account')}</span>
        </Link>
        <LogoutButton />
      </div>
    </>
  )
}

export function BottomNav() {
  const path = usePathname()
  const t = useTranslations('nav')

  const allItems = [
    { href: '/dashboard/nutrition', icon: Utensils, label: t('nutrition'), color: 'text-orange-400' },
    { href: '/dashboard/fitness', icon: Dumbbell, label: t('fitness'), color: 'text-emerald-400' },
    { href: '/dashboard/fitness/history', icon: TrendingUp, label: t('progress'), color: 'text-violet-400' },
    { href: '/dashboard/account', icon: User, label: t('account'), color: 'text-slate-400' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]">
      {allItems.map(({ href, icon: Icon, label, color }) => {
        const active = isActive(href, path) || (href === '/dashboard/account' && path.startsWith('/dashboard/account'))
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors relative ${
              active ? 'text-slate-900' : 'text-slate-400'
            }`}
          >
            {active && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-slate-900" />
            )}
            <Icon size={20} strokeWidth={active ? 2.5 : 1.75} />
            <span className={`text-[10px] font-semibold ${active ? 'text-slate-900' : 'text-slate-400'}`}>
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
