import { app, HttpRequest, InvocationContext, HttpMethod, HttpResponseInit } from "@azure/functions";
import { Hono } from 'hono';
import { RouterRoute } from "hono/types";

type AzureFunctionsV4HttpHandler = (req: HttpRequest, context: InvocationContext) => Promise<HttpResponseInit>;
type HeadersInit = [string, string][] | Record<string, string> | Headers;
type BodyInit = ReadableStream | XMLHttpRequestBodyInit;

// Register the Hono app as an Azure Functions HTTP handler
export function AzureFunctionsV4Adapter(name: string, hono: Hono, authLevel: 'anonymous' | 'function' | 'admin' = 'anonymous') {
  const handler: AzureFunctionsV4HttpHandler = async (req, context) => {
    const request = new Request(req.url, {
      headers: convertHttpRequestToHeadersInit(req),
      method: req.method,
      body: req.body as BodyInit
    });
    const res = await hono.fetch(request);
    return await convertResponseToHttpResponseInit(res);
  };
  const methods = convertRoutesToHttpMethod(hono.routes);
  app.http(name, {methods, authLevel, handler});
}

function convertRoutesToHttpMethod(routes: RouterRoute[]): HttpMethod[] {
  return unique(routes.map(route => route.method.toUpperCase() as HttpMethod).sort());
}

function convertHttpRequestToHeadersInit(req: HttpRequest): HeadersInit {
  const headers: HeadersInit = {};
  for (const key of Object.keys(req.headers)) {
    headers[key] = req.headers[key];
  }
  headers['getSetCookie'] = req.headers.get('set-cookie');
  
  return headers as HeadersInit;
}

function convertResponseToHeadersInit(response: Response): HeadersInit {
  const headers: any = new Headers();
  response.headers.forEach((value, key) => {
    headers.append(key, value);
  });
  // Add 'getSetCookie' method : undici does not support multiple 'set-cookie' headers
  headers.getSetCookie = ():string[] => response.headers.get('set-cookie')?.split(',') || [];
  return headers;
}

async function convertResponseToHttpResponseInit(response: Response): Promise<HttpResponseInit> {
  const res: HttpResponseInit = {
    status: response.status,
    headers: convertResponseToHeadersInit(response),
  };
  if (response.body) {
    res.body = await new Response(response.body).arrayBuffer();
  }
  return res;
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}