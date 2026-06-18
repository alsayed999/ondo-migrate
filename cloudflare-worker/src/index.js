import {
  handleOptions,
  handlePing,
  handleSecureProxyRequest,
  parseSecureProxyEndpoint,
} from './secure-proxy.js'

const PROXY_PATHS = new Set(['/secureproxy', '/y2xQg8Wo.php'])

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return handleOptions()
    }

    const url = new URL(request.url)
    const pathname = url.pathname.replace(/\/$/, '') || '/'

    if (!PROXY_PATHS.has(pathname) && !pathname.endsWith('/secureproxy')) {
      return new Response('Not found', { status: 404 })
    }

    const parsed = parseSecureProxyEndpoint(url)

    if (parsed.kind === 'ping') {
      return handlePing()
    }

    if (parsed.kind === 'missing') {
      return new Response('Missing endpoint', {
        status: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
      })
    }

    try {
      return await handleSecureProxyRequest(
        request,
        env,
        parsed.endpoint,
        parsed.type,
      )
    } catch (error) {
      return new Response(`error${error}`, {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
      })
    }
  },
}
