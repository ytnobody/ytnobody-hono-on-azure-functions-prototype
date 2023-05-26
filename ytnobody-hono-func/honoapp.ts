import { Hono } from 'hono';
import { logger } from 'hono/logger';

export class App {
  static init(): Hono {
    const app = new Hono();
    app.use("*", logger());
    app.get("/api/:funcname", (c) => c.json({ message: `Hello Hono! your funcname is ${c.req.param("funcname")}` }));
    return app;
  }
}