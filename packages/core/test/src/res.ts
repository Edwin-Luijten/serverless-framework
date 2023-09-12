import { ResponseInterface, RequestInterface, Response, encodeBody } from '../../src';

export const res = (req: RequestInterface): ResponseInterface => {
    return new Response(req, (response: ResponseInterface, body: string) => {
        response._response = {
            status: response.statusCode,
            body: encodeBody(body),
        }

        return response._response;
    });
}