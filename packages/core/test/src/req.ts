import { RequestInterface } from '../../src';

export const req: RequestInterface = {
    body: '',
    clientCountry: '',
    context: {},
    cookies: {},
    headers: {},
    ip: '',
    isBase64Encoded: false,
    method: '',
    params: {},
    userAgent: '',
    getCookie(key: string): string | undefined {
        return '';
    },
    getHeader(name: string): string | undefined {
        return '';
    },
    hasCookie(key: string): boolean {
        return false;
    },
    hasHeader(name: string): boolean {
        return false;
    },
    path: '/'
}
