'use client'

import { useEffect } from 'react'

export function DateCookieSetter() {
  useEffect(() => {
    const localDate = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD
    document.cookie = `yunity_local_date=${localDate}; path=/; max-age=86400`
  }, [])
  return null
}
