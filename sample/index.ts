import Koa from 'koa';
import SwaggerDoc from '../src/index';
import { TestController } from './controller';

const ctrl = new TestController();

const app = new Koa();
SwaggerDoc.init('1.0.0', '测试', '测试描述', '').serveKoa(
  app,
  '/swagger',
);
app.listen(9001);
