import { AnySchema, SchemaLikeWithoutArray } from 'joi';
import {
  OpenApi,
  OpenApiSchema,
  Responses,
  textPlain,
  Types,
  WebRequestSchema,
} from 'ts-openapi';
import {
  PathInput,
  PathInputDefinition,
} from 'ts-openapi/lib/openapi/openapi.types';
import {
  AllActionMap,
  AllActionParamMap,
  AllActionResultMap,
  AllControllerMap,
} from './store';

/**
 * 获取OpenApi所需的类型描述schema
 * @param key 属性key
 * @param value 属性值
 * @param required 是否必填
 * @returns
 */
export function getApiSchema(key: string, value: Object, required = false) {
  let schema: AnySchema;
  const params = { description: key, required };
  const type = value?.constructor;
  switch (type) {
    case Number:
      schema = Types.Number(params);
      break;
    case Boolean:
      schema = Types.Boolean(params);
      break;
    case String:
      schema = Types.String(params);
      break;
    case Date:
      schema = Types.Date(params);
      break;
    case Array:
      let arrayType: SchemaLikeWithoutArray;
      const array = <Array<any>>value;
      if (array.length) {
        arrayType = getApiSchema('0', array[0]);
      } else {
        arrayType = Types.Object({
          ...params,
          properties: {},
        });
      }
      schema = Types.Array({
        ...params,
        arrayType,
      });
      break;
    case Object:
      schema = Types.Object({
        ...params,
        properties: {
          ...Object.entries(value).reduce(
            (prev, [key, value]) => ({
              ...prev,
              [key]: getApiSchema(key, value),
            }),
            {},
          ),
        },
      });
      break;
    default:
      schema = Types.Object({
        ...params,
        properties: {},
      });
      break;
  }
  return schema;
}

/**
 * 由于ts-openapi处理后的json对象不符合swagger json格式
 * 进行body处理
 * @param schema
 * @returns
 */
export function processOpenApiSchema(schema: OpenApiSchema) {
  for (const key in schema.paths) {
    const path = schema.paths[key];
    // 处理request body
    if (path.post && path.post.requestBody) {
      path.post.parameters = path.post.parameters || [];
      const parameter = {
        in: 'body',
        description: path.post.requestBody.description,
        schema: path.post.requestBody.content?.['application/json']?.schema,
      };
      path.post.parameters?.push(parameter as any);
    }
  }
  return schema;
}

/**
 * 为openApi添加路由path
 * @param openApi
 */
export function processOpenApi(openApi: OpenApi, prefix: string = '') {
  Array.from(AllActionMap.keys()).forEach((prototype) => {
    const type = prototype.constructor;
    const controllerDef = AllControllerMap.get(type);
    const actionMap = AllActionMap.get(prototype);
    if (actionMap) {
      Array.from(actionMap.keys()).forEach((propertyKey) => {
        const actionDef = actionMap.get(propertyKey);
        const actionParamDef =
          AllActionParamMap.get(prototype)?.get(propertyKey);
        const actionResultDef =
          AllActionResultMap.get(prototype)?.get(propertyKey);
        if (controllerDef && actionDef) {
          // router全局前缀 + controller path + action path
          const fullPath = prefix + controllerDef.path + actionDef.path;
          let responses: Responses = {
            [200]: {
              description: '',
              content: {},
            },
          };
          // ts-openapi处理的response无法被swagger-ui识别
          // 使用json序列化的example
          if (actionResultDef && actionResultDef.length) {
            responses = {
              ...actionResultDef.reduce(
                (prev, cur) => ({
                  ...prev,
                  [cur.code]: textPlain(JSON.stringify(cur.responseExample)),
                }),
                {},
              ),
            };
          }
          const requestSchema: WebRequestSchema = {};
          if (actionParamDef && actionParamDef.length) {
            actionParamDef.forEach((paramDef) => {
              const example =
                paramDef.example ||
                (paramDef.type ? Reflect.construct(paramDef.type, []) : {});
              if (paramDef.paramFromType === 'body') {
                requestSchema['body'] = getApiSchema(
                  paramDef.description || '',
                  example,
                  paramDef.required,
                ) as any;
              } else if (
                paramDef.paramFromType === 'params' ||
                paramDef.paramFromType === 'query'
              ) {
                requestSchema[paramDef.paramFromType] = {
                  ...requestSchema[paramDef.paramFromType],
                  [paramDef.paramKey]: getApiSchema(
                    paramDef.description || '',
                    example,
                    paramDef.required,
                  ),
                };
              }
            });
          }
          let pathInputDef: PathInputDefinition = {
            tags: [controllerDef.tag],
            summary: actionDef.summary || actionDef.path,
            description: actionDef.description || '',
            operationId: fullPath,
            requestSchema,
            responses,
          };
          let inputDef: PathInput = {
            [actionDef.requestMethod]: pathInputDef,
          };
          openApi.addPath(fullPath, inputDef, true);
        }
      });
    }
  });
}
