import * as crypto from 'node:crypto';
import HttpStatusCode from './status-code';
import { CookieOptions, CorsOptions, JsonValue, RequestInterface, ResponseInterface } from './types';
import { encodeBody } from './encode';

export type ResponseTransformer = (response: ResponseInterface, body: string) => ResponseInterface;

export class Response implements ResponseInterface {
    _request: RequestInterface;
    headers: { [key: string]: Array<string> } = {};
    cookies: { [key: string]: string } = {};
    isBase64Encoded = false;
    _etag = false;
    statusCode: number = HttpStatusCode.OK;
    _response: any;
    _status: 'processing' | 'end' | 'error' = 'processing';
    body: any;

    private readonly cb: ((err: any, res: any, response: ResponseInterface) => void) | undefined;

    constructor(request: RequestInterface, private transform: ResponseTransformer, cb?: (err: any, res: any, response: ResponseInterface) => void) {
        this._request = request;
        this.cb = cb;
        this._status = 'processing';
    }

    status(code: number): this {
        this.statusCode = code;
        return this;
    }

    getHeader(name: string): string | undefined {
        return this.headers[name.toLowerCase()]?.toString();
    }

    setHeader(name: string, value: string, append = false): this {
        const _name = name.toLowerCase();
        this.headers[_name] = append ? this.hasHeader(_name) ? this.headers[_name].concat([value]) : [value] : [value];
        return this;
    }

    getHeaders(): { [key: string]: Array<string> } {
        return this.headers;
    }

    removeHeader(name: string): this {
        delete this.headers[name.toLowerCase()];
        return this;
    }

    hasHeader(name: string): boolean {
        return this.headers[name.toLowerCase()] !== undefined;
    }

    setCookie(name: string, value: string, options: CookieOptions): this {
        let cookieString =
            name +
            '=' +
            encodeURIComponent(encodeBody(value));

        cookieString += options.domain ? '; Domain=' + options.domain : '';

        cookieString +=
            options.expires && typeof options.expires.toUTCString === 'function'
                ? '; Expires=' + options.expires.toUTCString()
                : '';

        cookieString += options.httpOnly && options.httpOnly === true ? '; HttpOnly' : '';

        cookieString +=
            options.maxAge && !isNaN(options.maxAge)
                ? '; MaxAge=' +
                ((options.maxAge / 1000) | 0) +
                (!options.expires
                    ? '; Expires=' + new Date(Date.now() + options.maxAge).toUTCString()
                    : '')
                : '';

        cookieString += options.path ? '; Path=' + options.path : '; Path=/';

        cookieString += options.secure && options.secure === true ? '; Secure' : '';

        cookieString +=
            options.sameSite !== undefined
                ? '; SameSite=' +
                (options.sameSite === true
                    ? 'Strict'
                    : options.sameSite === false
                        ? 'Lax'
                        : options.sameSite)
                : '';

        this.setHeader('Set-Cookie', cookieString, true);

        return this;
    }

    json(body: JsonValue): void {
        this.setHeader('content-type', 'application/json').send(JSON.stringify(body));
    }

    sendStatus(code: number): void {
        this.status(code).send('');
    }

    cors(options: CorsOptions): this {
        const acao = this.getHeader('Access-Control-Allow-Origin');
        const acam = this.getHeader('Access-Control-Allow-Methods');
        const acah = this.getHeader('Access-Control-Allow-Headers');

        this.setHeader('Access-Control-Allow-Origin', options.origin ? options.origin : acao ? acao : '*');
        this.setHeader('Access-Control-Allow-Methods', options.methods ? options.methods : acam ? acam : 'GET, PUT, POST, DELETE, OPTIONS');
        this.setHeader('Access-Control-Allow-Headers', options.headers ? options.headers : acah ? acah : 'Content-Type, Authorization, Content-Length, X-Requested-With');

        if (options.maxAge && !isNaN(options.maxAge)) this.setHeader('Access-Control-Max-Age', ((options.maxAge / 1000) | 0).toString());
        if (options.credentials) this.setHeader('Access-Control-Allow-Credentials', options.credentials.toString());
        if (options.exposeHeaders) this.setHeader('Access-Control-Expose-Headers', options.exposeHeaders);

        return this;
    }

    etag(enable = true): this {
        this._etag = enable;
        return this;
    }

    cache(maxAge: string | number | boolean, isPrivate = false): this {
        if (typeof maxAge === 'string') this.setHeader('Cache-Control', maxAge);
        else if (typeof maxAge === 'boolean' && !maxAge) this.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        else {
            this.setHeader('Cache-Control', `${isPrivate ? 'private, ' : ''}max-age=${Number(maxAge)}`);
            this.setHeader('Expires', new Date(Date.now() + Number(maxAge)).toUTCString())
        }

        return this;
    }

    modified(date: Date | boolean = true) {
        if (date instanceof Date) this.setHeader('Last-Modified', date.toUTCString());
        else this.setHeader('Last-Modified', (new Date()).toUTCString());

        return this;
    }

    send(body: string): void {
        this._status = 'end';
        if (this._etag && ['get', 'head'].includes(this._request.method.toLowerCase()) && !this.hasHeader('etag') && this.statusCode === HttpStatusCode.OK) {
            this.setHeader('etag', `"${this.generateEtag(body)}"`);
        }

        const ifNoneMatch = this._request.getHeader('if-none-match');
        if (ifNoneMatch && ifNoneMatch === this.getHeader('etag')) {
            this.status(HttpStatusCode.NOT_MODIFIED);
            body = '';
        }

        if (this._request.method.toLowerCase() === 'head') body = '';

        const res = this.transform(this, body);

        if (this.cb) this.cb(null, res._response, res);
    }

    private generateEtag(body: string) {
        return crypto
            .createHash('sha256')
            .update(this.encodeBody(body))
            .digest('hex')
            .substring(0, 32)
    }

    private encodeBody(body: any): string {
        return typeof body === 'object' ? JSON.stringify(body) : body && typeof body !== 'string' ? body.toString() : body ? body : '';
    }
}