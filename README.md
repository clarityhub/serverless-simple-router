# @clarityhub/serverless-simple-router

![npm](https://img.shields.io/npm/v/@clarityhub/serverless-simple-router) ![Node.js CI](https://github.com/clarityhub/serverless-simple-router/workflows/Node.js%20CI/badge.svg)

A simple router solution for managing many routes from one lambda in a
serverless context.

```bash
npm i --save @clarityhub/serverless-simple-router
```

## Basic Usage

In these examples, we route paths to our router function using the following **serverless.yml** configuration:

```yml
service: example
provider:
  name: aws
  runtime: nodejs12.x
functions:
    root:
    handler: src/router.default
    events:
      - http:
          path: /
          method: any
          cors: true
      - http:
          path: /{proxy+}
          method: any
          cors: true
```

### Using Simple Routes

You can use the router to map routes to objects and methods:

```js
import { Router } from '@clarityhub/serverless-simple-router';

const tasks = {
    getAll(event, context, cb) {
        cb({ statusCode: 200 });
    },
    get(event, context, cb) {
        cb({ statusCode: 200 });
    },
    create(event, context, cb) {
        cb({ statusCode: 200 });
    },
    update(event, context, cb) {
        const id = event.pathParameter.id;
        cb({ statusCode: 200 });
    },
    delete(event, context, cb) {
        const id = event.pathParameter.id;
        cb({ statusCode: 200 });
    },
};

const routes = new Router();
routes.get('/tasks', tasks, 'getAll');
routes.post('/tasks', tasks, 'create');
routes.get('/tasks/:id', tasks, 'get');
routes.put('/tasks/:id', tasks, 'update');
routes.delete('/tasks/:id', tasks, 'delete');
export default routes.exec();
```

### Using Resources

You can use resources to simplify routes:

```js
// The routes above can be simplified to:
routes.resource('/tasks', tasks);
```

### Using RouteBuilder

To handle more complex routes with [middy](https://github.com/middyjs/middy) middleware support, you can use the `RouteBuilder` to create routes and resources.

Using RouteBuilder also lets you write async code without worrying about
callbacks.

```js
import { Router, RouteBuilder } from '@clarityhub/serverless-simple-router';

class TaskController {
    async getAll() {
        return [];
    }
    async create() {
        return {};
    }
}

// Create 1 route
routes.get('/tasks', RouteBuilder.method(TaskController, 'getAll'));

// Add middy Middleware
const middyMiddleware = [httpHeaderNormalizer(), cors(), bodyParser()];
routes.create('/tasks', RouteBuilder.method(TaskController, 'create', middyMiddleware));

// You can also use RouteBuilder with a resource:
routes.resource('/tasks', RouteBuilder.crud(TaskController, middyMiddleware));

export default routes.exec();
```

### RBAC with RouteBuilder

Since RBAC is a common pattern, we added a simplified version to the `RouteBuilder` automatically. The rbac object will be passed to middy middleware for you to evaluate:

```js
function useRbac(options) {
    return {
        async before({ context }) {
            // Demonstration by adding rbac options to context
            context.rbac = options.rbac;
        },
    };
}

class Tasks {
    create({ context }) {
        return context.rbac;
    }
}

/*
    When this route is called, it will return:
    { resource: 'tasks', action: 'create' }
*/
routes.create('/tasks', RouteBuilder.method(TaskController, 'create', [useRbac], { rbac: 'tasks' }));
```

## API

### Router

`new Router(options)`

Create a new router object

* `options` - object
  * `urlOptions` – takes properties from [url-pattern](https://www.npmjs.com/package/url-pattern).
  * `notFoundResponse` – what to return when a route is not found. Defaults to JSON 404 response.

`[method](path: String, obj: Object, objMethod: String)`

Add a handler using an object and object name. Supported methods are `get`, `post`, `put`, `delete`, `patch`.

Paths can take simple params as well. Example: `/tasks/:id`. The `id` param will be available via `event.pathParameter.id`.

`[method](path: String, routeBuilderMethod: RouteBuilderMethod)`

Add a handler using a RouteBuilder.

`resource(path: String, obj: Object)`

Add a set of handlers for get, geAll, create, update, and delete.

`resource(path: String, routeBuilderCrud: RouterBuilderCrud)`

Add a set of handlers using a RouteBuilder.

`exec(): Function`

Returns a function for you to pass back to the lambda.

#### RouteBuilder

`RouteBuilder.method(Controller: Class, method: String, additionalMiddleware: Array<Middy>, options: Object)`

Create a single RouteBuilderMethod using a Class (not an instance/object).


`RouteBuilder.crud(Controller: Class, additionalMiddleware: Array<Middy>, options: Object)`

Create a RouteBuilderCrud using a Class (not an instance/object).

## Developing

You can run tests via the cli:

```bash
npm run test
```

## License

MIT Licensed
