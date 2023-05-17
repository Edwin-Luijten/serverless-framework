import { ResponseInterface, encodeBody } from '@serverless-framework/core';

export function responseTransformer(response: ResponseInterface, body: string): ResponseInterface {
    response._response = {
        statusCode: response.statusCode,
        headers: response.headers,
        multiValueHeaders: response.headers,
        isBase64Encoded: response.isBase64Encoded,
        body: response._request.method === 'HEAD' ? '' : encodeBody(body)
    }

    // Map the headers to a simple key value format
    Object.keys(response._response.headers).forEach((key) => {
        response._response.headers[key.toLowerCase()] = response._response.headers[key][0];
    });

    return response;
}