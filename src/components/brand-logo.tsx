import { templateConfig, isSvgLogo } from '@/config/template'

type BrandLogoProps = {
  id?: string
  className?: string
}

export function BrandLogo({ id, className }: BrandLogoProps) {
  const { logo, logoHeight, brandName, showLogoWordmark } = templateConfig
  const height = logoHeight

  if (isSvgLogo(logo)) {
    return (
      <div
        id={id}
        className={`brand-lockup template-brand${className ? ` ${className}` : ''}`}
        style={{ height }}
        role="img"
        aria-label={brandName}
      >
        <div
          className="template-brand-icon"
          dangerouslySetInnerHTML={{ __html: logo }}
        />
        {showLogoWordmark && (
          <span className="template-brand-wordmark">{brandName}</span>
        )}
      </div>
    )
  }

  return (
    <div
      id={id}
      className={`brand-lockup template-brand${className ? ` ${className}` : ''}`}
      style={{ height }}
    >
      <img
        src={logo}
        alt={brandName}
        className="template-brand-img"
        style={{ height: '100%', width: 'auto' }}
      />
    </div>
  )
}
