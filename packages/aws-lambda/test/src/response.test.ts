import { Api } from '../../src/';
import { HttpStatusCode, RequestInterface, ResponseInterface } from '../../../core';
import v1Event from '../events/event-apigateway-v1.json';
import v2Event from '../events/event-apigateway-v2.json';
import { APIGatewayProxyEvent, APIGatewayProxyEventV2 } from 'aws-lambda';

const api = new Api({
    base: '/api',
});

api.get('version', (req: RequestInterface, res: ResponseInterface) => {
    res.status(HttpStatusCode.OK).json({
        version: 1,
    });
});

describe('Responses', () => {
    it('It should transform a response to apigateway v1 response', async () => {
        const result = await api.run(v1Event as unknown as APIGatewayProxyEvent);

        expect(result).toEqual({
            body: '{"version":1}',
            headers: {
                'content-type': ['application/json'],
            },
            isBase64Encoded: false,
            statusCode: HttpStatusCode.OK,
        });
    });

    it('It should transform a response to apigateway v2 response', async () => {
        const result = await api.run(v2Event as unknown as APIGatewayProxyEventV2);

        expect(result).toEqual({
            body: '{"version":1}',
            headers: {
                'content-type': ['application/json'],
            },
            isBase64Encoded: false,
            statusCode: HttpStatusCode.OK,
        });
    });
});