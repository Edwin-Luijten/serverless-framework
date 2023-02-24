---
layout: default
title: AWS Lambda
parent: Providers
nav_order: 2
---

# AWS Lambda
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Installation

```shell
npm install @serverless-framework/aws-lambda
```
[AWS Lambda with Node.js](https://docs.aws.amazon.com/lambda/latest/dg/lambda-nodejs.html){:target="_blank"}{: .btn .btn-purple .mr-2 }  

---

## Usage

{% highlight typescript %}  
import { RequestInterface, ResponseInterface, HttpStatusCode } from '@serverless-framework/core';
import { Api } from '@serverless-framework/aws-lambda';
import { APIGatewayProxyEvent, APIGatewayProxyEventV2, Context } from 'aws-lambda';

const API_VERSION = '1.0.0';

const api = new Api({
  base: '/api',
});

api.get('/version', (req: RequestInterface, res: ResponseInterface) => {
  req.status(HttpStatusCode.OK).json({
    version: API_VERSION,
  });
});

export const handler = api.handle((event: APIGatewayProxyEvent | APIGatewayProxyEventV2, context: Context) => await api.run());

{% endhighlight %}

### Parameters
{% highlight typescript %}
api.get('/users/:id', (req: RequestInterface<{params: {id: string}}>, res: ResponseInterface) => {
      req.status(HttpStatusCode.OK).json({
      id: params.id,
  });
});
{% endhighlight %}

## Localstack

---

Next: Learn more about [routing]({% link docs/routing.md %}).