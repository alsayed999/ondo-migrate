import { templateConfig } from '@/config/template'

export function applyTemplateMeta(): void {
  document.title = templateConfig.pageTitle

  const favicon =
    document.querySelector<HTMLLinkElement>('link[rel="icon"]') ??
    document.createElement('link')

  favicon.rel = 'icon'
  favicon.href = templateConfig.favicon

  if (!favicon.parentNode) {
    document.head.appendChild(favicon)
  }
}
