import { Api } from '../../src';
import { HttpStatusCode, RequestInterface, ResponseInterface } from '../../../core';
import v1Event from '../events/event-apigateway-v1.json';
import v2Event from '../events/event-apigateway-v2.json';
import { APIGatewayProxyEvent, APIGatewayProxyEventV2 } from 'aws-lambda';

const api = new Api({
    base: '/api',
});

api.get('header/set', (req: RequestInterface, res: ResponseInterface) => {
    res.setHeader('foo', 'bar');
    res.status(HttpStatusCode.OK).json({
        version: 1,
        contentType: req.getHeader('content-type'),
    });
});

v1Event.path = '/api/header/set';
v2Event.requestContext.http.path = '/api/header/set';

describe('Headers', () => {
    it('It should add a new header to an apigateway v1 response', async () => {
        const result = await api.run(v1Event as unknown as APIGatewayProxyEvent);

        expect(result).toEqual({
            body: '{"version":1,"contentType":"application/json"}',
            headers: {
                'content-type': 'application/json',
                'foo': 'bar',
            },
            isBase64Encoded: false,
            statusCode: HttpStatusCode.OK,
        });
    });

    it('It should add a new header to an apigateway v2 response', async () => {
        const result = await api.run(v2Event as unknown as APIGatewayProxyEventV2);

        expect(result).toEqual({
            body: '{"version":1,"contentType":"application/json"}',
            headers: {
                'content-type': 'application/json',
                'foo': 'bar',
            },
            isBase64Encoded: false,
            statusCode: HttpStatusCode.OK,
        });
    });
});