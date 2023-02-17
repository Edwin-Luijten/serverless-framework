import { IncomingHttpHeaders } from 'node:http';

export type JsonValue =
    | string
    | number
    | boolean
    | { [key: string]: JsonValue }
    | Array<JsonValue>;

export type ParamsDictionary = { [key: string]: string };

export type CorsOptions = {
    credentials?: boolean;
    exposeHeaders?: string;
    headers?: string;
    maxAge?: number;
    methods?: string;
    origin?: string;
}

export type CookieOptions = {
    maxAge?: number;
    signed?: boolean;
    expires?: Date;
    httpOnly?: boolean;
    path?: string;
    domain?: string;
    secure?: boolean;
    encode?: ((val: string) => string);
    sameSite?: boolean | 'lax' | 'strict' | 'none';
}

export type Context = { [key: string]: string };

export interface RequestInterface<P = ParamsDictionary, Res = any, ReqBody = any, Query = {}> {
    params: P;

    headers: IncomingHttpHeaders;

    getHeader(name: string): string | undefined;

    hasHeader(name: string): boolean;

    method: string;

    path: string;

    ip: string | null;

    cookies: { [key: string]: string };

    hasCookie(key: string): boolean;

    getCookie(key: string): string | undefined;

    isBase64Encoded: boolean;

    body: ReqBody;
}

export interface ResponseInterface<Res = any> {
    statusCode: number;

    status(code: number): this;

    sendStatus(code: number): void;

    send: Send<Res, void>;

    json: Send<Res, void>;

    cookies: { [key: string]: string };

    setCookie(name: string, value: string, options?: CookieOptions): this;

    headers: { [key: string]: Array<string> };

    setHeader(name: string, value: string, append: boolean): this;
    setHeader(name: string, value: string): this;

    getHeader(name: string): string | undefined;

    cache(maxAge: string | number | boolean, isPrivate: boolean): this
    cache(maxAge: string | number | boolean): this

    _response: any;
    _request: RequestInterface;
    _status: 'processing' | 'end' | 'error';
    isBase64Encoded: boolean;
    body: any;
}

export type Send<Res = any, T = ResponseInterface<Res>> = (body?: Res) => T;

export type NextFunction = (err?: any) => void;

export type RequestHandler<
    P = ParamsDictionary,
    Res = any,
    Req = any,
    Query = {}
> = (req: RequestInterface<P, Res, Req, Query>, res: ResponseInterface, next?: NextFunction) => JsonValue | void;
export type ErrorHandler<
    P = ParamsDictionary,
    Res = any,
    Req = any,
    Query = {}
> = (err: any, req: RequestInterface<P, Res, Req, Query>, res: ResponseInterface, next?: NextFunction) => JsonValue | void;

export type Handler = RequestHandler | ErrorHandler;