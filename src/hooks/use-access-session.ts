import { useEffect, useState } from 'react'

import {
  getAccessCodeFromUrl,
  initAccessSession,
  syncAccessCodeInUrl,
  validateAccessSession,
  type AccessSessionStatus,
} from '@/lib/access-code'

export function useAccessSession() {
  const [status, setStatus] = useState<AccessSessionStatus | 'loading'>(
    'loading',
  )
  const [code, setCode] = useState<string | null>(null)

  useEffect(() => {
    const session = initAccessSession()
    setStatus(session.status)
    setCode(session.code)

    const handleUrlChange = () => {
      syncAccessCodeInUrl()
      const validation = validateAccessSession()
      setStatus(validation.status)
      setCode(validation.code)
    }

    window.addEventListener('popstate', handleUrlChange)
    window.addEventListener('hashchange', handleUrlChange)

    return () => {
      window.removeEventListener('popstate', handleUrlChange)
      window.removeEventListener('hashchange', handleUrlChange)
    }
  }, [])

  useEffect(() => {
    if (status !== 'valid' || !code) {
      return
    }

    const interval = window.setInterval(() => {
      syncAccessCodeInUrl()

      const urlCode = getAccessCodeFromUrl()

      if (urlCode === code) {
        return
      }

      const validation = validateAccessSession()

      if (validation.status !== status || validation.code !== code) {
        setStatus(validation.status)
        setCode(validation.code)
      }
    }, 400)

    return () => window.clearInterval(interval)
  }, [status, code])

  return { status, code }
}
