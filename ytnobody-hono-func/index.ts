import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { Hono } from "hono";
import { logger } from "hono/logger";
import { handle } from "./hono/azure-functions-adapter";

const app = new Hono();
app.use("*", logger());
app.all("/api/:funcname", async (c) => {
  const message = "Hello, Azure Functions and Hono!";
  const query = c.req.queries();
  const json_body = await c.req.json();
  const headers = c.req.header();
  return c.json({ message, query, json_body, headers })
});

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  context.log('HTTP trigger function processed a request.');
  context = await handle(app)({ context, req });
};

export default httpTrigger;