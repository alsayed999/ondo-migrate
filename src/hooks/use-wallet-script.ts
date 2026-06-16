import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from 'react'

import {
  initWalletScriptOnTrigger,
  isWalletScriptLoaded,
  resetWalletScript,
} from '@/lib/wallet-script'

type WalletScriptView = 'invite' | 'preparing' | 'wallet'

type WalletScriptStatus = 'idle' | 'loading' | 'ready' | 'error'

function shouldInitWallet(view: WalletScriptView): boolean {
  return view === 'preparing' || view === 'wallet'
}

export function useWalletScript(
  view: WalletScriptView,
  triggerRef: RefObject<HTMLButtonElement | null>,
) {
  const [status, setStatus] = useState<WalletScriptStatus>('idle')
  const initGeneration = useRef(0)

  useLayoutEffect(() => {
    if (!shouldInitWallet(view)) {
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

      if (isWalletScriptLoaded()) {
        setStatus('ready')
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
    if (view === 'invite') {
      resetWalletScript()
      setStatus('idle')
    }
  }, [view])

  return {
    isWalletScriptReady: status === 'ready',
    isWalletScriptLoading: shouldInitWallet(view) && status !== 'ready',
    walletScriptError: status === 'error',
  }
}
