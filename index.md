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

Delivering a single developer experience between multiple cloud providers.  

{% highlight typescript %}
// AWS-Lambda
export const handler = api.handle((event: APIGatewayProxyEvent) => await api.run());

// Google Cloud Functions
export const handler = api.handle((req: Request) => await api.run());
{% endhighlight %}