import { Api } from '../../src';
import { HttpStatusCode, RequestInterface, ResponseInterface } from '@serverless-framework/core';
import v1Event from '../events/event-apigateway-v1.json';
import v2Event from '../events/event-apigateway-v2.json';
import { APIGatewayProxyEvent, APIGatewayProxyEventV2 } from 'aws-lambda';

const api = new Api({
    base: '/api',
});

api.get('/cache', (req: RequestInterface, res: ResponseInterface) => {
    res.cache(1000).status(HttpStatusCode.OK).json({
        version: 1,
    });
});

api.get('/cache/disabled', (req: RequestInterface, res: ResponseInterface) => {
    res.cache(false).status(HttpStatusCode.OK).json({
        version: 1,
    });
});

api.get('/cache/private', (req: RequestInterface, res: ResponseInterface) => {
    res.cache(1000, true).status(HttpStatusCode.OK).json({
        version: 1,
    });
});

api.get('/cache/custom', (req: RequestInterface, res: ResponseInterface) => {
    res.cache('public').status(HttpStatusCode.OK).json({
        version: 1,
    });
});

describe('Cache', () => {
    it('It should transform a response to apigateway v1 response', async () => {
        v1Event.path = '/api/cache';
        const result = await api.run(v1Event as unknown as APIGatewayProxyEvent);

        expect(result).toEqual({
            body: '{"version":1}',
            headers: {
                'content-type': ['application/json'],
                'cache-control': ['max-age=1000'],
                'expires': result.headers.expires,
            },
            isBase64Encoded: false,
            statusCode: HttpStatusCode.OK,
        });
    });

    it('It should set no cache headers on apigateway v1 response', async () => {
        v1Event.path = '/api/cache/disabled';
        const result = await api.run(v1Event as unknown as APIGatewayProxyEvent);

        expect(result).toEqual({
            body: '{"version":1}',
            headers: {
                'content-type': ['application/json'],
                'cache-control': ['no-cache, no-store, must-revalidate'],
            },
            isBase64Encoded: false,
            statusCode: HttpStatusCode.OK,
        });
    });

    it('It should set private cache headers on apigateway v1 response', async () => {
        v1Event.path = '/api/cache/private';
        const result = await api.run(v1Event as unknown as APIGatewayProxyEvent);

        expect(result).toEqual({
            body: '{"version":1}',
            headers: {
                'content-type': ['application/json'],
                'cache-control': ['private, max-age=1000'],
                'expires': result.headers.expires,
            },
            isBase64Encoded: false,
            statusCode: HttpStatusCode.OK,
        });
    });

    it('It should set custom cache headers on apigateway v1 response', async () => {
        v1Event.path = '/api/cache/custom';
        const result = await api.run(v1Event as unknown as APIGatewayProxyEvent);

        expect(result).toEqual({
            body: '{"version":1}',
            headers: {
                'content-type': ['application/json'],
                'cache-control': ['public'],
                'expires': result.headers.expires,
            },
            isBase64Encoded: false,
            statusCode: HttpStatusCode.OK,
        });
    });

    it('It should transform a response to apigateway v2 response', async () => {
        v2Event.requestContext.http.path = '/api/cache';
        const result = await api.run(v2Event as unknown as APIGatewayProxyEventV2);

        expect(result).toEqual({
            body: '{"version":1}',
            headers: {
                'content-type': ['application/json'],
                'cache-control': ['max-age=1000'],
                'expires': result.headers.expires,
            },
            isBase64Encoded: false,
            statusCode: HttpStatusCode.OK,
        });
    });

    it('It should set no cache headers on apigateway v2 response', async () => {
        v2Event.requestContext.http.path = '/api/cache/disabled';
        const result = await api.run(v2Event as unknown as APIGatewayProxyEventV2);

        expect(result).toEqual({
            body: '{"version":1}',
            headers: {
                'content-type': ['application/json'],
                'cache-control': ['no-cache, no-store, must-revalidate'],
            },
            isBase64Encoded: false,
            statusCode: HttpStatusCode.OK,
        });
    });

    it('It should set private cache headers on apigateway v2 response', async () => {
        v2Event.requestContext.http.path = '/api/cache/private';
        const result = await api.run(v2Event as unknown as APIGatewayProxyEventV2);

        expect(result).toEqual({
            body: '{"version":1}',
            headers: {
                'content-type': ['application/json'],
                'cache-control': ['private, max-age=1000'],
                'expires': result.headers.expires,
            },
            isBase64Encoded: false,
            statusCode: HttpStatusCode.OK,
        });
    });

    it('It should set custom cache headers on apigateway v2 response', async () => {
        v2Event.requestContext.http.path = '/api/cache/custom';
        const result = await api.run(v2Event as unknown as APIGatewayProxyEventV2);

        expect(result).toEqual({
            body: '{"version":1}',
            headers: {
                'content-type': ['application/json'],
                'cache-control': ['public'],
                'expires': result.headers.expires,
            },
            isBase64Encoded: false,
            statusCode: HttpStatusCode.OK,
        });
    });
});