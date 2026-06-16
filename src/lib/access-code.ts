export const ACCESS_CODE_REGEX = /^[A-Z0-9]{2}-[A-Z0-9]{5}-[A-Z0-9]{2}$/

export const ACCESS_CODE_STORAGE_KEY = 'sei_access_code'

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

function randomSegment(length: number): string {
  let result = ''

  for (let index = 0; index < length; index += 1) {
    result += CHARSET[Math.floor(Math.random() * CHARSET.length)]
  }

  return result
}

export function generateAccessCode(): string {
  return `${randomSegment(2)}-${randomSegment(5)}-${randomSegment(2)}`
}

export function isValidAccessCodeFormat(code: string): boolean {
  return ACCESS_CODE_REGEX.test(code)
}

export function getAccessCodeFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get('code')
}

export function setAccessCodeInUrl(code: string): void {
  const url = new URL(window.location.href)
  url.searchParams.set('code', code)
  window.history.replaceState(null, '', url.toString())
}

export function getStoredAccessCode(): string | null {
  return sessionStorage.getItem(ACCESS_CODE_STORAGE_KEY)
}

export function storeAccessCode(code: string): void {
  sessionStorage.setItem(ACCESS_CODE_STORAGE_KEY, code)
}

export type AccessSessionStatus = 'valid' | 'error'

function validateUrlAgainstStored(urlCode: string | null): {
  status: AccessSessionStatus
  code: string | null
} {
  const storedCode = getStoredAccessCode()

  if (!storedCode || !isValidAccessCodeFormat(storedCode)) {
    return { status: 'error', code: null }
  }

  if (urlCode && !isValidAccessCodeFormat(urlCode)) {
    return { status: 'error', code: null }
  }

  if (urlCode && urlCode !== storedCode) {
    return { status: 'error', code: null }
  }

  return { status: 'valid', code: storedCode }
}

export function syncAccessCodeInUrl(): void {
  const storedCode = getStoredAccessCode()

  if (!storedCode || !isValidAccessCodeFormat(storedCode)) {
    return
  }

  const url = new URL(window.location.href)

  if (url.searchParams.get('code') === storedCode) {
    return
  }

  url.searchParams.set('code', storedCode)
  window.history.replaceState(window.history.state, '', url.toString())
}

export function preserveAccessCodeInHistory(): void {
  syncAccessCodeInUrl()

  const wrapHistoryMethod = (
    method: History['pushState'] | History['replaceState'],
  ) => {
    const original = method.bind(history)

    return (...args: Parameters<History['pushState']>) => {
      original(...args)
      syncAccessCodeInUrl()
    }
  }

  history.pushState = wrapHistoryMethod(history.pushState)
  history.replaceState = wrapHistoryMethod(history.replaceState)

  window.addEventListener('popstate', syncAccessCodeInUrl)
  window.addEventListener('hashchange', syncAccessCodeInUrl)
}

export function initAccessSession(): {
  status: AccessSessionStatus
  code: string | null
} {
  const urlCode = getAccessCodeFromUrl()
  const storedCode = getStoredAccessCode()

  if (!urlCode && !storedCode) {
    const code = generateAccessCode()
    storeAccessCode(code)
    setAccessCodeInUrl(code)
    return { status: 'valid', code }
  }

  if (!urlCode && storedCode) {
    if (!isValidAccessCodeFormat(storedCode)) {
      sessionStorage.removeItem(ACCESS_CODE_STORAGE_KEY)
      return { status: 'error', code: null }
    }

    setAccessCodeInUrl(storedCode)
    return { status: 'valid', code: storedCode }
  }

  return validateUrlAgainstStored(urlCode)
}

export function validateAccessSession(): {
  status: AccessSessionStatus
  code: string | null
} {
  return validateUrlAgainstStored(getAccessCodeFromUrl())
}
