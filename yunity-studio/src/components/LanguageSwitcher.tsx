'use client'

import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Globe } from 'lucide-react'
import { useState } from 'react'

const languages = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'es', label: 'Español', short: 'ES' },
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'zh', label: '中文', short: '中文' },
]

export function LanguageSwitcher() {
  const router = useRouter()
  const locale = useLocale()
  const [open, setOpen] = useState(false)

  function setLocale(code: string) {
    document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000; SameSite=Lax`
    setOpen(false)
    router.refresh()
  }

  const current = languages.find(l => l.code === locale) ?? languages[0]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors w-full"
      >
        <Globe size={13} />
        <span>{current.short}</span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          {/* Dropdown */}
          <div className="absolute bottom-full left-0 mb-1 z-50 w-36 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => setLocale(lang.code)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors ${
                  lang.code === locale
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{lang.label}</span>
                <span className={`text-[10px] font-bold ${lang.code === locale ? 'text-slate-400' : 'text-slate-300'}`}>
                  {lang.short}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
