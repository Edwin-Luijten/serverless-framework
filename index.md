---
layout: default
title: Home
nav_order: 1
permalink: 
---

<img src="/serverless-framework/assets/images/logo.png" width="200px" align="right" alt="logo"/>

# Serverless Framework

> Quickly start your next serverless api project.  

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![AWS Lambda](https://img.shields.io/badge/AWS%20Lambda-%23FF9900?style=for-the-badge&logo=awslambda&logoColor=white)
![Google Cloud Functions](https://img.shields.io/badge/Google%20Cloud%20Functions-%234285F4?style=for-the-badge&logo=google&logoColor=white)
![Azure Functions](https://img.shields.io/badge/Azure%20Functions-%230078D7?style=for-the-badge&logo=azurefunctions&logoColor=white)

Our goal is to deliver a single developer experience between multiple cloud providers.  

{% highlight typescript %}
// ... imports
const API_VERSION = '1.0.0';

const api = new Api({
    base: '/api',
});

api.get('/version', (req: RequestInterface, res: ResponseInterface) => {
    req.status(HttpStatusCode.OK).json({
        version: API_VERSION,
    });
});

// AWS-Lambda
export const handler = api.handle((event: APIGatewayProxyEvent) => await api.run());

// Google Cloud Functions
export const handler = api.handle((req: Request) => await api.run());
{% endhighlight %}