import {
  SwaggerController,
  SwaggerAction,
  SwaggerActionParam,
  SwaggerActionResult,
} from '../src/index';

type Model = {
  name: string;
  value: string;
};


const example = {
  name: 'foo',
  value: 'bar',
};

@SwaggerController('/test', '测试')
export class TestController {
  @SwaggerAction('/test-action', 'post', '测试action', '测试action描述')
  @SwaggerActionResult({ name: '123', value: [1, 2, 3] })
  @SwaggerActionResult({ code: 0, message: 'error' }, 400)
  testAction(
    @SwaggerActionParam('id', 'params', 'id描述', true, 123) id: string,
    @SwaggerActionParam('name', 'query', 'name描述', false, 'z') name: string,
    @SwaggerActionParam('model', 'body', 'model描述', true, example) model: Model,
  ): Model {
    return { name: '123', value: '123' };
  }

  @SwaggerAction('/test-action-1', 'post', '测试action', '测试action描述')
  testAction1(
    @SwaggerActionParam('model', 'body', 'model描述', true, [example]) list: Model[],
  ): Model {
    return { name: '123', value: '123' };
  }
}
