import 'reflect-metadata';
import { OpenApi, OpenApiSchema } from 'ts-openapi';
import * as Koa from 'koa';
export * from './decorators';
import { processOpenApi, processOpenApiSchema } from './utils';
import { serveKoa } from './route';

let openApi: OpenApi;
let json: OpenApiSchema;

type SwaggerApiDoc = {
  /**
   * 初始化
   * @param version 版本号
   * @param title API文档标题
   * @param description API文档描述
   * @param maintainer API文档维护人
   * @param prefix 全局route path前缀
   * @returns this
   */
  init: (
    version: string,
    title: string,
    description: string,
    maintainer?: string,
    prefix?: string,
  ) => SwaggerApiDoc;

  /**
   * 设置license
   * @param license license名称
   * @param url license地址
   * @param termOfService license term地址
   * @returns this
   */
  setLicense: (
    license: string,
    url: string,
    termOfService: string,
  ) => SwaggerApiDoc;

  /**
   * 设置swagger测试请求地址
   * @param url
   * @returns this
   */
  setServer: (url: string) => SwaggerApiDoc;

  /**
   * 生成swagger文档json描述
   * @returns
   */
  generateJson: () => OpenApiSchema;

  /**
   * 为swagger文档注册一个Koa路由
   * @param app Koa实例
   * @param path 路由path
   * @returns app Koa实例
   */
  serveKoa: (app: Koa, path: string) => Koa;
};

export default {
  init(
    version: string,
    title: string,
    description: string,
    maintainer?: string,
    prefix?: string,
  ) {
    openApi = new OpenApi(version, title, description, maintainer || '');
    openApi.setServers([{ url: '' }]);
    processOpenApi(openApi, prefix);
    return this;
  },
  setLicense(license: string, url: string, termOfService: string) {
    openApi?.setLicense(license, url, termOfService);
    return this;
  },
  setServer(url: string) {
    openApi?.setServers([{ url }]);
    return this;
  },
  generateJson() {
    if (!json) {
      json = processOpenApiSchema(openApi?.generateJson());
      console.log('json: ', JSON.stringify(json));
    }
    return json;
  },
  serveKoa(app: Koa, path: string) {
    return serveKoa(app, path, this.generateJson());
  },
} as SwaggerApiDoc;
