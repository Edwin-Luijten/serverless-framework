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
router.get('/api/users', (req: RequestInterface, res: ResponseInterface) => {});
router.post('/api/users/:id', (req: RequestInterface, res: ResponseInterface) => {});
router.put('/api/users/:id', (req: RequestInterface, res: ResponseInterface) => {});
router.patch('/api/users/:id', (req: RequestInterface, res: ResponseInterface) => {});
router.delete('/api/users/:id', (req: RequestInterface, res: ResponseInterface) => {});
router.any('/api/users/:id', (req: RequestInterface, res: ResponseInterface) => {});
```

## Parameters

## Middlewares

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