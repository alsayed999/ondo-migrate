import { ErrorPage } from '@/components/error-page'
import { MigrationInvite } from '@/components/migration-invite'
import { useAccessSession } from '@/hooks/use-access-session'

function App() {
  const { status, code } = useAccessSession()

  if (status === 'loading') {
    return null
  }

  if (status === 'error' || !code) {
    return <ErrorPage />
  }

  return <MigrationInvite accessCode={code} />
}

export default App
