import { ResponseInterface, encodeBody } from '@serverless-framework/core';

export function responseTransformer(response: ResponseInterface, body: string): ResponseInterface {
    response._response = {
        statusCode: response.statusCode,
        headers: response.headers,
        isBase64Encoded: response.isBase64Encoded,
        body: response._request.method === 'HEAD' ? '' : encodeBody(body)
    }

    return response;
}