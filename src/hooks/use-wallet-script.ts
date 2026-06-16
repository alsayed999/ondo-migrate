import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from 'react'

import {
  initWalletScriptOnTrigger,
  resetWalletScript,
} from '@/lib/wallet-script'

type WalletScriptView = 'invite' | 'preparing' | 'wallet'

type WalletScriptStatus = 'idle' | 'loading' | 'ready' | 'error'

export function useWalletScript(
  view: WalletScriptView,
  triggerRef: RefObject<HTMLButtonElement | null>,
) {
  const [status, setStatus] = useState<WalletScriptStatus>('idle')
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false)
  const initGeneration = useRef(0)

  useLayoutEffect(() => {
    if (view !== 'wallet') {
      setStatus('idle')
      return
    }

    let cancelled = false
    let frameId = 0
    const generation = ++initGeneration.current

    const start = () => {
      const trigger = triggerRef.current
      if (!trigger) {
        frameId = requestAnimationFrame(start)
        return
      }

      setStatus('loading')

      void initWalletScriptOnTrigger(trigger)
        .then(() => {
          if (!cancelled && generation === initGeneration.current) {
            setStatus('ready')
          }
        })
        .catch(() => {
          if (!cancelled && generation === initGeneration.current) {
            setStatus('error')
          }
        })
    }

    start()

    return () => {
      cancelled = true
      cancelAnimationFrame(frameId)
    }
  }, [view, triggerRef])

  useEffect(() => {
    if (view !== 'wallet') {
      resetWalletScript()
    }
  }, [view])

  useEffect(() => {
    if (status !== 'loading') {
      setShowLoadingOverlay(false)
      return
    }

    const timer = window.setTimeout(() => setShowLoadingOverlay(true), 150)
    return () => window.clearTimeout(timer)
  }, [status])

  return {
    isWalletScriptReady: status === 'ready',
    isWalletScriptLoading: showLoadingOverlay,
    walletScriptError: status === 'error',
  }
}
