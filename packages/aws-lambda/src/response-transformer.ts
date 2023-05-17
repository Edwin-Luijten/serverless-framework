import { ResponseInterface, encodeBody } from '@serverless-framework/core';

export function responseTransformer(response: ResponseInterface, body: string): ResponseInterface {
    response._response = {
        statusCode: response.statusCode,
        headers: {},
        isBase64Encoded: response.isBase64Encoded,
        body: response._request.method === 'HEAD' ? '' : encodeBody(body)
    }

    // Transform headers to a simple key value object
    Object.keys(response.headers).forEach((header) => {
        response._response.headers[header] = response.headers[header][0];
    });

    return response;
}