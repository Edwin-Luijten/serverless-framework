import { RouteNotFoundError, Router } from '@serverless-framework/router';
import HttpStatusCode from './status-code';
import { CorsOptions, ErrorHandler, Handler, RequestHandler, RequestInterface, ResponseInterface } from './types';

export type ApiOptions = {
    base?: string;
    cors?: CorsOptions;
}

export interface ApiInterface {
    run(...args: any[]): void;
}

export class BaseApi {
    private router: Router<Handler>;
    private middlewares: Array<Handler> = [];

    constructor(options?: ApiOptions) {
        this.router = new Router(options?.base ?? '/');
    }

    public use(...handlers: Array<Handler>): this {
        this.middlewares = this.middlewares.concat(handlers);

        return this;
    }

    public any(path: string, ...handlers: Array<Handler>): this {
        this.router.any(path, ...this.middlewares.concat(handlers));

        return this;
    }

    public get(path: string, ...handlers: Array<Handler>): this {
        this.router.get(path, ...this.middlewares.concat(handlers));

        return this;
    }

    public post(path: string, ...handlers: Array<Handler>): this {
        this.router.post(path, ...this.middlewares.concat(handlers));

        return this;
    }

    public put(path: string, ...handlers: Array<Handler>): this {
        this.router.put(path, ...this.middlewares.concat(handlers));

        return this;
    }

    public patch(path: string, ...handlers: Array<Handler>): this {
        this.router.patch(path, ...this.middlewares.concat(handlers));

        return this;
    }

    public delete(path: string, ...handlers: Array<Handler>): this {
        this.router.delete(path, ...this.middlewares.concat(handlers));

        return this;
    }

    public head(path: string, ...handlers: Array<Handler>): this {
        this.router.head(path, ...this.middlewares.concat(handlers));

        return this;
    }

    public options(path: string, ...handlers: Array<Handler>): this {
        this.router.options(path, ...this.middlewares.concat(handlers));

        return this;
    }

    public group(prefix: string, cb: (api: this) => void, beforeHandlers: Array<Handler>, afterHandlers: Array<Handler>) {
        this.router.applyPrefix(prefix);
        this.router.applyBeforeMiddlewares(beforeHandlers);
        this.router.applyAfterMiddlewares(afterHandlers);

        cb(this);

        this.router.removePrefix();
        this.router.removeBeforeMiddlewares();
        this.router.removeAfterMiddlewares();
    }

    public async handle(req: RequestInterface, res: ResponseInterface): Promise<any> {

        try {
            const route = this.router.lookup(req.method, req.path);

            if (route.params) {
                req.params = route.params;
            }

            const handlers = route.handlers.filter(handler => handler.length === 2 || handler.length === 3) as Array<RequestHandler>;
            const routeErrorHandlers = route.handlers.filter(handler => handler.length === 4) as Array<ErrorHandler>;

            for (const handler of handlers) {
                if (res._status !== 'processing') break;

                await new Promise<void>(async (resolve) => {
                    try {
                        const rtrn = await handler(req, res, () => {
                            resolve();
                        });

                        if (rtrn) res.send(rtrn);
                        if (res._status === 'end') resolve();
                    } catch (e: any) {
                        await this.handleErrors(e, req, res, routeErrorHandlers);
                        resolve();
                    }
                });
            }

            return res._response;
        } catch (e: any) {
            if (e instanceof RouteNotFoundError) {
                res.sendStatus(HttpStatusCode.NOT_FOUND);
                return res._response;
            }
        }

        return res._response;
    }

    private async handleErrors(e: any, req: RequestInterface, res: ResponseInterface, handlers: Array<ErrorHandler>): Promise<void> {
        for (const handler of handlers) {
            if (res._status !== 'processing') break;

            await new Promise<void>(async (resolve) => {
                try {
                    const rtrn = await handler(e, req, res, () => {
                        resolve();
                    });

                    if (rtrn) res.send(rtrn);
                    if (res._status === 'end') resolve();
                } catch (e: any) {
                    resolve();
                }
            });
        }
    }
}