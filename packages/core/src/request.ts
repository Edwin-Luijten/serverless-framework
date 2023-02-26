import { ParsedUrlQuery } from 'node:querystring';
import { Context, ParamsDictionary, RequestInterface } from './types';

export class Request implements RequestInterface {
    params: ParamsDictionary = {};
    query: ParsedUrlQuery = {};
    headers: { [key: string]: string | undefined } = {};
    body: any = {};
    path = '';
    method = 'GET';
    context: Context = {};
    userAgent: string | undefined;
    cookies: { [key: string]: string } = {};
    ip: string | null = null;
    isBase64Encoded = false;
    clientCountry: string | undefined;

    getHeader(name: string): string | undefined {
        return this.headers[name.toLowerCase()];
    }

    hasHeader(name: string): boolean {
        return this.headers[name.toLowerCase()] !== undefined;
    }

    hasCookie(name: string): boolean {
        return this.cookies[name.toLowerCase()] !== undefined;
    }

    getCookie(name: string): string | undefined {
        return this.cookies[name.toLowerCase()];
    }
}