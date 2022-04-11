export type RequestMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

export type ActionParamFromType = 'params' | 'query' | 'body';

export interface ControllerDefinition {
  path: string;
  tag: string;
}

export const AllControllerMap = new Map<Function, ControllerDefinition>();

export interface ActionResultDefinition {
  responseExample: Object;
  code: number;
}

export const AllActionResultMap = new Map<
  Object,
  Map<string | symbol, ActionResultDefinition[]>
>();

export interface ActionDefinition {
  path: string;
  requestMethod: RequestMethod;
  summary: string;
  description: string;
}

export const AllActionMap = new Map<
  Object,
  Map<string | symbol, ActionDefinition>
>();

export interface ActionParamDefinition {
  paramKey: string;
  paramFromType: ActionParamFromType;
  type: any;
  description?: string;
  required?: boolean;
  example?: any;
}

export const AllActionParamMap = new Map<
  Object,
  Map<string | symbol, ActionParamDefinition[]>
>();
