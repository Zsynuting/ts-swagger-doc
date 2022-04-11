import {
  AllActionMap,
  ActionParamDefinition,
  AllActionParamMap,
  ActionParamFromType,
  AllControllerMap,
  RequestMethod,
  ActionDefinition,
  AllActionResultMap,
  ActionResultDefinition,
} from './store';

/**
 * 修饰controller类
 * @param path controller的route path
 * @param tag 接口分组
 * @returns
 */
export function SwaggerController(path: string, tag: string): ClassDecorator {
  return (target: Function) => {
    AllControllerMap.set(target, { tag, path });
  };
}

/**
 * 修饰controller类的action，提供一个返回对象的例子，用来描述接口返回
 * @param responseExample 返回对象例子
 * @param code
 * @returns
 */
export function SwaggerActionResult(
  responseExample?: any,
  code: number = 200,
): MethodDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    // 获取ts定义的返回值类型
    // 如果返回值类型是interface或者type，获取到为undefined
    const responseType = Reflect.getMetadata(
      'design:returntype',
      target,
      propertyKey,
    );

    const actionResultMap =
      AllActionResultMap.get(target) ||
      new Map<string | symbol, ActionResultDefinition[]>();
    const actionResultList: ActionResultDefinition[] =
      actionResultMap.get(propertyKey) || [];
    actionResultList.push({
      code,
      responseExample:
        responseExample ||
        (responseType ? Reflect.construct(responseType, []) : {}),
    });
    actionResultMap.set(propertyKey, actionResultList);
    AllActionResultMap.set(target, actionResultMap);
  };
}

/**
 * 修饰controller类的action，用来生成接口描述
 * @param path action对应的route path
 * @param requestMethod action支持的request类型
 * @param summary 接口标题
 * @param description 接口描述
 * @returns
 */
export function SwaggerAction(
  path: string,
  requestMethod: RequestMethod,
  summary?: string,
  description?: string,
): MethodDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const actionMap =
      AllActionMap.get(target) || new Map<string | symbol, ActionDefinition>();
    actionMap.set(propertyKey, {
      path,
      requestMethod,
      summary: summary || propertyKey.toString(),
      description: description || '',
    });
    AllActionMap.set(target, actionMap);
  };
}

/**
 * 修饰controller类的action的参数，用来生成接口的参数列表描述
 * @param paramKey 参数名称
 * @param paramType 参数来源
 * @param description 参数描述
 * @param required 是否必要
 * @param example 参数例子
 * @returns
 */
export function SwaggerActionParam(
  paramKey: string,
  paramFromType: ActionParamFromType,
  description?: string,
  required?: boolean,
  example?: any,
): ParameterDecorator {
  return (
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number,
  ) => {
    const actionParamMap =
      AllActionParamMap.get(target) ||
      new Map<string | symbol, ActionParamDefinition[]>();
    const actionParamDefs: ActionParamDefinition[] =
      actionParamMap.get(propertyKey) || [];
    const paramMetadata = Reflect.getMetadata(
      'design:paramtypes',
      target,
      propertyKey,
    );
    const type = paramMetadata[parameterIndex];
    actionParamDefs[parameterIndex] = {
      paramKey,
      paramFromType,
      description,
      required,
      example,
      type,
    };
    actionParamMap.set(propertyKey, actionParamDefs);
    AllActionParamMap.set(target, actionParamMap);
  };
}
