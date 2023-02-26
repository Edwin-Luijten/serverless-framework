import { APIGatewayProxyEvent, APIGatewayProxyEventV2 } from 'aws-lambda';
import { Request, RequestInterface, decodeBody } from '@serverless-framework/core';
import * as querystring from 'querystring';

export function eventTransformer(event: APIGatewayProxyEvent | APIGatewayProxyEventV2): RequestInterface {
    const req: RequestInterface = new Request();
    const isV2 = isV2Event(event);

    if (isV2) {
        req.method = event.requestContext.http.method.toUpperCase();
        req.path = event.requestContext.http.path;
    } else {
        req.method = event.httpMethod.toUpperCase();
        req.path = event.path;
    }

    // Headers
    req.headers = Object.keys(event.headers).reduce(
        (acc, header) =>
            Object.assign(acc, {[header.toLowerCase()]: event.headers[header]}),
        {}
    );

    // Cookies
    const cookies = isV2 ? event.cookies ?? [] : req.headers?.cookie?.split(';') ?? [];

    req.cookies = cookies.reduce((acc, cookie) => {
        const _cookie = cookie.trim().split('=');
        return Object.assign(acc, {
            [_cookie[0]]: decodeBody(decodeURIComponent(_cookie[1])),
        });
    }, {});

    const requestContext = event.requestContext;

    req.ip = (req.hasHeader('x-forwarded-for') && req.getHeader('x-forwarded-for')?.split(',')[0].trim()) ||
        (requestContext['identity'] &&
            requestContext['identity']['sourceIp'] &&
            requestContext['identity']['sourceIp'].split(',')[0].trim());

    req.isBase64Encoded = event.isBase64Encoded;
    req.clientCountry = event.headers['cloudfront-viewer-country'];
    req.userAgent = req.headers['user-agent'];

    // Body
    const body = req.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString() : event.body;

    if (req.hasHeader('content-type') && req.getHeader('content-type') === 'application/x-www-form-urlencoded') {
        req.body = querystring.parse(body ?? '');
    } else if (typeof body === 'object') {
        req.body = body;
    } else {
        req.body = decodeBody(body ?? '{}');
    }

    return req;
}

function isV2Event(event: APIGatewayProxyEvent | APIGatewayProxyEventV2): event is APIGatewayProxyEventV2 {
    return (event as APIGatewayProxyEventV2)?.version === '2.0';
}