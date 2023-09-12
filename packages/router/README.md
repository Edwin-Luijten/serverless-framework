<img src="../../logo.png" align="right" alt="logo"/>

# Serverless Framework Router

> The router implements its routing based on the concept of
> a [radix tree](https://en.wikipedia.org/wiki/Radix_tree) ([trie](https://en.wikipedia.org/wiki/Trie)).

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

## Contents

* [Installation](#installation)
* [Creating routes](#creating-routes)
* [Groups](#groups)
* [Middlewares](#middlewares)
* [Implementation](#implementation)

## Installation

```shell
npm install @serverless-framework/router
```

## Creating routes

Each route can have multiple handlers which will be executed in the order they are provided.

```typescript
import { Router } from '@serverless-framework/router';

type RequestInterface = {
    method: number;
    headers: {[key: string]: string};
};

type ResponseInterface = {
    sendStatus: (number) => void;
    status: (number) => this;
    json: (body: any) => void;
};

type RequestHandler = (req: RequestInterface, res: ResponseInterface) => void;

const router = new Router<RequestHandler>();

// The following methods are supported:
// get, post, put, delete, connect, patch, head, options, trace and any
router.get('/api/users', (req: RequestInterface, res: ResponseInterface) => {});
router.post('/api/users/:id', (req: RequestInterface, res: ResponseInterface) => {});
router.put('/api/users/:id', (req: RequestInterface, res: ResponseInterface) => {});
router.patch('/api/users/:id', (req: RequestInterface, res: ResponseInterface) => {});
router.delete('/api/users/:id', (req: RequestInterface, res: ResponseInterface) => {});
// wildcard route (eg: /api/files/john/avatar/image.png):
router.get('/api/files/*filepath', (req: RequestInterface, res: ResponseInterface) => {
    // /john/avatar/image.png
    console.log(req.params.filepath);
});
```

## Groups

Instead of repeating a prefix, it is also possible to group routes.
```typescript
import { Router } from '@serverless-framework/router';

// ...

const router = new Router<RequestHandler>();

router.group('/api', (api: Router<RequestHandler>) => {
    api.group('/blog', (blog: Router<RequestHandler>) => {
        // /api/blog
        // /api/blog/foo
        blog.get('/', (req: RequestInterface, res: ResponseInterface) => {});
        blog.get('/:slug', (req: RequestInterface, res: ResponseInterface) => {});
    });

    api.group('/admin', (admin: Router<RequestHandler>) => {
        admin.group('/blog', (blogAdmin: Router<RequestHandler>) => {
            // /api/admin/blog
            // /api/admin/blog/1
            blogAdmin.get('/', (req: RequestInterface, res: ResponseInterface) => {});
            blogAdmin.get('/:id', (req: RequestInterface, res: ResponseInterface) => {});
        });
    });
});
```

## Middlewares

A Middleware is just a request handler, except error middlewares, these will be executed when an exception occurs.

```typescript
import { Router } from '@serverless-framework/router';

// ...

const router = new Router<RequestHandler>();

function authMiddleware(req: RequestInterface, res: ResponseInterface) {
    if (!req.hasHeader('token')) {
        return res.sendStatus(401);
    }
}

// This is an error handler middleware, when an error is thrown, 
// all the error middlewares will be called.
function validationErrorMiddleware(e: any, req: RequestInterface, res: ResponseInterface) {
    if (e instanceof ValidationError) {
        return res.status(400).json(transformErrors(e));
    }
}

// For a single route
router.get('/api/users/:id', authMiddleware, (req: RequestInterface, res: ResponseInterface) => {});

// For groups
router.group('/api', (api) => {
    api.group('admin', (admin) => {
        // ...
    }, [authMiddleware], [validationErrorMiddleware]);
});
```

## Implementation

This is a basic example implementation with Node's http package.

```typescript
import * as http from 'node:http';
import { IncomingMessage, ServerResponse } from 'node:http';
import { MethodNotAllowedError, RouteNotFoundError, Router } from '@serverless-framework/router';

// Create a custom request that supports route parameters
type Request = {
    params: { [key: string]: string }
} & IncomingMessage;

type Response = {} & ServerResponse;

// Define a handler
type Handler = (req: Request, res: Response) => void;

// Setup the router
const router = new Router<Handler>();

router.get('/blog/:slug/comments', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify({id: req.params.slug}));
    res.end();
});

// Setup the server
http.createServer(async function (req: IncomingMessage, res: ServerResponse) {
    if (!req.url || !req.method) {
        res.statusCode = 404;
        res.end();
        return;
    }

    try {
        const route = router.lookup(req.method, req.url);
        const _req = req as Request;
        // Assign route params to the request
        _req.params = route.params;

        const _res = res as Response;

        for (const handler of route.handlers) {
            await handler(_req, _res);
        }
    } catch (e) {
        if (e instanceof MethodNotAllowedError) {
            res.statusCode = 405;
            return res.end();
        } else if (e instanceof RouteNotFoundError) {
            res.statusCode = 404;
            return res.end();
        } else {
            res.statusCode = 500;
            return res.end();
        }
    }
}).listen(8080);
```
