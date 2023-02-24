import { ResponseInterface, RequestInterface, Response } from '../../src';

export const res = (req: RequestInterface): ResponseInterface => {
    return new Response(req, (response: ResponseInterface, body: string) => {
        response._response = {
            status: response.statusCode,
        }

        return response._response;
    });
}