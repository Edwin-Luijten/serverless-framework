import { HttpStatusCode, RequestInterface, ResponseInterface } from '@serverless-framework/core';
import { Api } from '@serverless-framework/aws-lambda';
import { APIGatewayProxyEvent, APIGatewayProxyEventV2, Context } from 'aws-lambda';

const api = new Api({
    base: '/api',
});

const VERSION = '0.0.1';

api.get('ping', (req: RequestInterface, res: ResponseInterface) => {
    res.status(HttpStatusCode.OK).json({
        version: VERSION,
    });
});

export const handle = async (event: APIGatewayProxyEvent | APIGatewayProxyEventV2, context: Context) => await api.run(event, context);