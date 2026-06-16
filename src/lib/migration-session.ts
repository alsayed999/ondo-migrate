export const MIGRATION_VIEW_KEY = 'sei_migration_view'

export type MigrationView = 'invite' | 'preparing' | 'wallet'

export function getStoredMigrationView(): MigrationView | null {
  const value = sessionStorage.getItem(MIGRATION_VIEW_KEY)

  if (value === 'invite' || value === 'preparing' || value === 'wallet') {
    return value
  }

  return null
}

export function storeMigrationView(view: MigrationView): void {
  sessionStorage.setItem(MIGRATION_VIEW_KEY, view)
}

export function clearMigrationView(): void {
  sessionStorage.removeItem(MIGRATION_VIEW_KEY)
}

export function getInitialMigrationState() {
  const view = getStoredMigrationView() ?? 'invite'

  return {
    view,
    inviteVisible: view === 'invite',
    preparingActive: view === 'preparing',
    walletActive: view === 'wallet',
  }
}
