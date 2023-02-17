---
layout: default
title: Installation
nav_order: 2
---

# Installation
{: .no_toc }

  
{: .fs-6 .fw-300 }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

The easiest way of starting a new project is by using `create-serverless-project`.

## Create Serverless Project

```bash
npx create-serverless-project api aws-lambda
```

## Manual installation

```bash
npm install @serverless-framework/core @serverless-framework/aws-lambda
```
In the future we will also support the following providers:
- @serverless-framework/google-cloud-functions  
- @serverless-framework/azure-functions
