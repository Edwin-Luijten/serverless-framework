---
layout: default
title: Routing
nav_order: 4
---

# Routing
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Methods

```typescript
import { RequestInterface, ResponseInterface, HttpStatusCode } from '@serverless-framework/core';
// No matter which provider you use, the signature is the same.
import { createApi } from '@serverless-framework/aws-lambda';

const API_VERSION = '1.0.0';

const api = createApi({
    base: '/api',
});

api.get('/api/users', (req: RequestInterface, res: ResponseInterface) => {});
api.post('/api/users/:id', (req: RequestInterface, res: ResponseInterface) => {});
api.put('/api/users/:id', (req: RequestInterface, res: ResponseInterface) => {});
api.patch('/api/users/:id', (req: RequestInterface, res: ResponseInterface) => {});
api.delete('/api/users/:id', (req: RequestInterface, res: ResponseInterface) => {});
api.any('/api/users/:id', (req: RequestInterface, res: ResponseInterface) => {});
```

## Parameters
{% highlight typescript %}
// ...

api.get('/users/:id', (req: RequestInterface<{params: {id: string}}>, res: ResponseInterface) => {
        req.status(HttpStatusCode.OK).json({
        id: params.id,
    });
});

// Wildcard routes are supported as well:
// url: /files/avatars/1000/avatar.png
api.get('/files/+filename', (req: RequestInterface<{params: {filename: string}}>, res: ResponseInterface) => {
    // filename: /avatars/1000/avatar.png
    req.status(HttpStatusCode.OK).json({
        filename: params.filename,
    });
});
{% endhighlight %}

## Grouping 
{% highlight typescript %}
// ...

api.group('/users', (router: Router) => {
    router.get('/:id', (req: RequestInterface<{params: {id: string}}>, res: ResponseInterface) => {
        req.status(HttpStatusCode.OK).json({
            id: params.id,
        });
    });
});
{% endhighlight %}

## Middlewares
Having middlewares is as easy as adding more handlers to a route.  
Middlewares will be executed by the order you define them.  

{% highlight typescript %}
// ...

function authMiddleware(req: RequestInterface, res: ResponseInterface) {
    if (req.hasHeader('Authorization')) {
        res.sendStatus(HttpStatusCode.UNAUTHORIZED);
    }
}

api.get('/users/:id', authMiddleware, (req: RequestInterface<{params: {id: string}}>, res: ResponseInterface) => {
    req.status(HttpStatusCode.OK).json({
        id: params.id,
    });
});
{% endhighlight %}

{: .important-title }
> Stopping the chain of execution
> 
>The chain of execution will be ended when a response is sent by methods like:
>`sendStatus() or json()`.

## Error handlers

## Stand-alone usage

### Installation

```shell
npm install @serverless-framework/router
```

### Example server

Below is a simple example that uses Node's build-in http server.  

{% highlight typescript %}  
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
{% endhighlight %}