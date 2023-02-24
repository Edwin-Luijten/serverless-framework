#!/usr/bin/env bash
PROJECT='/app'
TOOLS='/app/docker'

source ${TOOLS}/shell-tools/style.sh

section "Building/Installing serverless local"
cd ${PROJECT}
cecho "npm install -g npm serverless @serverless/components && npm install serverless-webpack serverless-localstack" 36
npm install -g npm serverless @serverless/components && npm install serverless-webpack serverless-localstack
cecho "[OK]" 32

section "Deploying serverless local"
cd ${PROJECT}
cecho "npm run deploy:local" 36
AWS_DEFAULT_REGION=${DEFAULT_REGION} npm run deploy:local
cecho "[OK]" 32

section "Attaching nodemon"
cd ${PROJECT}
AWS_DEFAULT_REGION=${DEFAULT_REGION} npm run watch
