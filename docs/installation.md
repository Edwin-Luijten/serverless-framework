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

The easiest way of starting a new project is by using `create-sf-project`.
![](/serverless-framework/assets/images/cli.png "cli")

## Create Serverless Project

```bash
npx create-sf-project
```
When no arguments are given, the wizard will be used to gather some information.

### Usage

```shell
npx @serverless-framework/create-roject <project-directory> <provider> [features]
```

#### Options
`--features` a comma separated list of addons. See [Providers](#providers) for more information.

### Providers

#### AWS-Lambda
```shell
npx @serverless-framework/create-roject . aws-lambda [features]
```
#### features
- [serverless](https://www.serverless.com/framework/docs){:target="_blank"}
- [localstack](https://docs.localstack.cloud/overview/){:target="_blank"}

## Manual installation

```bash
npm install @serverless-framework/core @serverless-framework/aws-lambda
```
In the future we will also support the following providers:
- @serverless-framework/google-cloud-functions  
- @serverless-framework/azure-functions