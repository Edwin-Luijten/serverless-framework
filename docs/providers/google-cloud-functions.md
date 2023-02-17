---
layout: default
title: Google Cloud Functions
parent: Providers
nav_order: 2
---

# Google Cloud Functions

{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Installation

```shell
npm install @serverless-framework/google-cloud-functions
```

[Google Cloud Functions with Node.js](https://cloud.google.com/functions/docs/writing){:target="_blank"}{: .btn .btn-purple .mr-2 }

---

## Usage

{% highlight typescript %}  
import { RequestInterface, ResponseInterface, HttpStatusCode } from '@serverless-framework/core';
import { Api } from '@serverless-framework/google-cloud-functions';
// Only importing the types @types/express
import { Request } from 'express';

const API_VERSION = '1.0.0';

const api = new Api({
   base: '/api',
});

api.get('/version', (req: RequestInterface, res: ResponseInterface) => {
      req.status(HttpStatusCode.OK).json({
      version: API_VERSION,
   });
});

export const handler = api.handle((req: Request) => await api.run());

{% endhighlight %}

### Parameters

{% highlight typescript %}
api.get('/users/:id', (req: RequestInterface<{params: {id: string}}>, res: ResponseInterface) => {
        req.status(HttpStatusCode.OK).json({
        id: params.id,
    });
});
{% endhighlight %}

---

Next: Learn more about [routing]({% link docs/routing.md %}).