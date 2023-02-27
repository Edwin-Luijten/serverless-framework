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

{% highlight typescript %}
import { RequestInterface, ResponseInterface, HttpStatusCode } from '@serverless-framework/core';
// No matter which provider you use, the signature is the same.
import { Api } from '@serverless-framework/<provider>';

const api = new Api({
    base: '/api',
});

api.get('/api/users', (req: RequestInterface, res: ResponseInterface) => 
    res.sendStatus(HttpStatusCode.OK));
api.post('/api/users/:id', (req: RequestInterface, res: ResponseInterface) => 
    res.sendStatus(HttpStatusCode.OK));
api.put('/api/users/:id', (req: RequestInterface, res: ResponseInterface) => 
    res.sendStatus(HttpStatusCode.OK));
api.patch('/api/users/:id', (req: RequestInterface, res: ResponseInterface) => 
    res.sendStatus(HttpStatusCode.OK));
api.delete('/api/users/:id', (req: RequestInterface, res: ResponseInterface) => 
    res.sendStatus(HttpStatusCode.OK));
api.any('/api/users/:id', (req: RequestInterface, res: ResponseInterface) => 
    res.sendStatus(HttpStatusCode.OK));
{% endhighlight %}

## Parameters
{% highlight typescript %}
api.get('/users/:id', (req: RequestInterface<{id: string}>, res: ResponseInterface) => {
    req.status(HttpStatusCode.OK).json({
        id: params.id,
    });
});

// Wildcard routes are supported as well:
// url: /files/avatars/1000/avatar.png
api.get('/files/+file', (req: RequestInterface<{file: string}>, res: ResponseInterface) => {
    // file: /avatars/1000/avatar.png
    req.status(HttpStatusCode.OK).json({
        filename: params.file,
    });
});
{% endhighlight %}

## Request typing
It's possible to define types for your parameters, query and body.

{% highlight typescript %}
const handler = (req: RequestInterface<{title: string}, {page: number}, {text: string}>, res) => {
    const title = req.params.title;
    const page = req.query.page;
    const text = req.body.text;
}
{% endhighlight %}

## Grouping 
{% highlight typescript %}
api.group('/users', (api: Api) => {
    api.get('/:id', (req: RequestInterface<{id: string}>, res: ResponseInterface) => {
        req.status(HttpStatusCode.OK).json({
            id: params.id,
        });
    });
});
{% endhighlight %}

## Middlewares
Having middlewares is as easy as adding more handlers to a route.  
Middlewares will be executed by the order you define them.  

{: .important-title }
> Stopping the chain of execution
>
>The chain of execution will be ended when a response is sent by methods like:
>`sendStatus(), send() or json()`.

### Per route
{% highlight typescript %}
function authMiddleware(req: RequestInterface, res: ResponseInterface, next?: NextFunction) {
    if (req.hasHeader('Authorization')) {
        res.sendStatus(HttpStatusCode.UNAUTHORIZED);
    }

    // Continue with the next handler
    if (next) next();
}

api.get('/users/:id', authMiddleware, (req: RequestInterface<{id: string}>, res: ResponseInterface) => {
    req.status(HttpStatusCode.OK).json({
        id: params.id,
    });
});
{% endhighlight %}

### Per group

{% highlight typescript %}
api.group('/users', (router: Router) => {
    router.get('/:id', (req: RequestInterface<{id: string}>, res: ResponseInterface) => {
        req.status(HttpStatusCode.OK).json({
            id: params.id,
        });
    });
}, authMiddleware, validationErrorMiddleware);
{% endhighlight %}

### Globally

{% highlight typescript %}
api.use(authMiddleware, validationErrorMiddleware);
{% endhighlight %}

## Error handlers
You can define error handlers the same way as middlewares, the signature is slightly different.
Also for error handlers, the order is respected.  
{% highlight typescript %}
function validationErrorMiddleware(err: any, req: RequestInterface, res: ResponseInterface, next?: NextFunction) {
    if (e instanceof ValidationError) {
        // parse the validation error and format it to your own standard (or not).
        res.status(HttpStatusCode.BAD_REQUEST).json(err);
    }

    // Continue, this will go the the next error handler, in this case the errorMiddleware
    if (next) next();
});

function errorMiddleware(err: any, req: RequestInterface, res: ResponseInterface, next?: NextFunction) {
    console.error('Something went wrong', err);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: err.message,
    });
});

api.use(validationErrorMiddleware, errorMiddleware);
{% endhighlight %}

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