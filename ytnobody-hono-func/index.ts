import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

import { Hono } from "hono";
import { logger } from "hono/logger";
import { handle } from "./adapter/handler";

const hono = new Hono();
hono.use('*', logger())

hono.all('/api/:funcname', async (c) => {
  const message = 'Hello, Azure Functions and Hono!'
  const query = c.req.queries()
  const json_body = c.req.method === "POST" ? await c.req.json() : {};
  const headers = c.req.header()
  return c.json({ message, query, json_body, headers })
})

export async function httpTrigger(req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    console.log(`Http function processed request for url "${JSON.stringify(req)}"`);
    const handler = handle(hono)
    return await handler({ context, req })
};

// app.http('httpTrigger', {
//     methods: ['GET', 'POST'],
//     authLevel: 'anonymous',
//     handler: httpTrigger
// });