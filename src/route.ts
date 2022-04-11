import Application from 'koa';
import KoaRouter from 'koa-router';
import { OpenApiSchema } from 'ts-openapi';
const swaggerUI = require('swagger-ui-koa');

export function serveKoa(app: Application, path: string, json: OpenApiSchema) {
  const router = new KoaRouter();
  router.get('/swagger', swaggerUI.setup(json));
  app.use(router.routes()).use(router.allowedMethods()).use(swaggerUI.serve);
  return app;
}
