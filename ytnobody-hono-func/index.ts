import { Hono } from 'hono'
import { AzureFunctionsV4Adapter } from './hono-adapter-azure-functions'

const hono = new Hono();
hono.get('/api/:funcname', async (c) => {
  const funcname = c.req.param('funcname');
  c.text(`Hello, ${funcname} world!`);
});

AzureFunctionsV4Adapter('hello', hono);
