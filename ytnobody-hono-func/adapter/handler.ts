import type { Hono } from 'hono'

import {
    InvocationContext,
    HttpRequest,
    HttpResponseInit,
    Cookie,
} from '@azure/functions'

export interface AzureFunctionsHTTPEvent {
  context: InvocationContext
  req: HttpRequest
}

export const handle = (app: Hono) => {
  return async (event: AzureFunctionsHTTPEvent): Promise<HttpResponseInit> => {
    try {
      const req = createRequest(event)
      const res = await app.fetch(req)

      return await createResult(res)
    } catch (err) {
      event.context.error(err)
      return {
        status: 500,
        body: err,
      }
    }
  }
}

const createRequest = (event: AzureFunctionsHTTPEvent): Request => {
  const urlPath = event.req.url
  const url = urlPath ?? ''

  const headersKV: { [key: string]: string } = {}
  for (const [k, v] of Object.entries(event.req.headers)) {
    if (v !== undefined) headersKV[k] = v as string
  }

  const headers = new Headers(headersKV)

  const method = event.req.method ?? 'GET'
  const requestInit: RequestInit = {
    headers,
    method,
  }

  if (event.req.body) {
    requestInit.body = JSON.stringify(event.req.body)
  }

  return new Request(url, requestInit)
}

const createResult = async (
  res: Response
): Promise<HttpResponseInit> => {

  const headers : string[][] = []
  for (const [k, v] of Object.entries(res.headers)) {
    headers[k] = v
  }

  const contentType = res.headers.get('content-type')
  headers['Content-Type'] = contentType ?? 'text/plain'
  const cookies = buildCookies(res.headers)
  const status = res.status
  const enableContentNegotiation = res.headers.get('content-type') !== 'application/octet-stream'
  const rtn : HttpResponseInit = {
    headers, 
    cookies,
    status,
    enableContentNegotiation,
  } 
  if (contentType && contentType.includes('application/json')) {
    rtn.jsonBody = await res.json()
  } 
  if (rtn.jsonBody === undefined) {
    rtn.body = await res.text()
  }
  return rtn
}

const buildCookies = (headers: Headers): Cookie[] => {
  const cookies: Cookie[] = []
  const setCookieHeaders = headers.get('set-cookie')
    .split(';')
    .map((s) => s.trim())
  if (setCookieHeaders) {
    for (const setCookieHeader of setCookieHeaders) {
      const cookie = parseCookie(setCookieHeader)
      if (cookie) {
        cookies.push(cookie)
      }
    }
  }
  return cookies
}

const parseCookie = (setCookieHeader: string): Cookie | undefined => {
  const [name, value, domain, path, expires, httpOnly, secure, sameSite, maxAge] = setCookieHeader.split(';')
  if (name && value) {
    return {
      name: name.trim(),
      value: value.trim(),
      domain: domain ? domain.trim() : undefined,
      path: path ? path.trim() : undefined,
      expires: expires ? new Date(expires.trim()) : undefined,
      httpOnly: httpOnly ? httpOnly.trim() === 'HttpOnly' : undefined,
      secure: secure ? secure.trim() === 'Secure' : undefined,
      sameSite: sameSite ? sameSite.trim() as 'Strict' | 'Lax' | 'None' : undefined,
      maxAge: maxAge ? parseInt(maxAge.trim()) : undefined,
    }
  } else {
    return undefined
  } 
}
