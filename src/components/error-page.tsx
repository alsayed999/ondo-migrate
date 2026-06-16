import { BrandLogo } from '@/components/brand-logo'

import '@/styles/invite.css'

export function ErrorPage() {
  return (
    <div className="invite-page">
      <div className="bg-grid" />
      <div className="bg-radial" />

      <div className="invite-card" id="cardContainer">
        <div className="logo-container">
          <BrandLogo id="brandLogo" />
        </div>

        <h1>An error has occurred</h1>
        <p className="description" style={{ marginBottom: 0 }}>
          The access code in this link is invalid or has expired.
          <br />
          Please check your link and try again.
        </p>
      </div>
    </div>
  )
}
