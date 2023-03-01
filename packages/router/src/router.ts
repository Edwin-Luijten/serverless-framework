import { type Route, Tree } from './radix/tree';
import { MethodNotAllowedError, RouteNotFoundError } from './error';

const methodIndexMap: Record<string, number> = {
    get: 0,
    head: 1,
    post: 2,
    put: 3,
    patch: 4,
    delete: 5,
    options: 6,
    any: 7,
};

export type Method =
    'get'
    | 'post'
    | 'put'
    | 'delete'
    | 'patch'
    | 'head'
    | 'options'
    | 'any' & string;

export class Router<Handler> {
    // Tree per method
    private readonly trees: Map<string, Tree<Handler>> = new Map<string, Tree<Handler>>();
    private prefix = '';
    private beforeMiddlewares: Array<Handler> = [];
    private afterMiddlewares: Array<Handler> = [];

    public constructor(private readonly base: string = '/') {
        if (!base.endsWith('/')) {
            this.base = `${base}/`;
        }

        // Remove double forward slashes
        this.base = this.base.replaceAll(/(?<temp1>[^:]\/)\/+/gu, '$1');

        // Create a tree for each method
        for (const [key,] of Object.entries(methodIndexMap)) {
            this.trees.set(key, new Tree(key));
        }
    }

    private static validateMethod(method: string): void {
        const _method = method.toLowerCase();
        if (typeof methodIndexMap[_method] === 'undefined') {
            throw new MethodNotAllowedError(_method, JSON.stringify(Object.keys(methodIndexMap).join(', ')));
        }
    }

    public group(prefix: string, callback: (router: Router<Handler>) => void, beforeMiddlewares: Array<Handler> = [], afterMiddlewares: Array<Handler> = []): void {
        this.applyPrefix(prefix);

        this.beforeMiddlewares = beforeMiddlewares;
        this.afterMiddlewares = afterMiddlewares;

        callback(this);

        this.beforeMiddlewares = [];
        this.afterMiddlewares = [];

        this.removePrefix();
    }

    public applyPrefix(prefix: string): void {
        let _prefix = prefix;

        if (!_prefix.endsWith('/')) {
            _prefix = `${_prefix}/`;
        }

        this.prefix = this.prefix.concat(_prefix);
    }

    public removePrefix(): void {
        this.prefix = '';
    }

    public applyBeforeMiddlewares(middlewares: Array<Handler>): void {
        this.beforeMiddlewares = middlewares;
    }

    public removeBeforeMiddlewares(): void {
        this.beforeMiddlewares = [];
    }

    public applyAfterMiddlewares(middlewares: Array<Handler>): void {
        this.afterMiddlewares = middlewares;
    }

    public removeAfterMiddlewares(): void {
        this.afterMiddlewares = [];
    }

    public any(path: string, ...handlers: Array<Handler>): this {
        this.add('any', path, ...handlers);
        return this;
    }

    public get(path: string, ...handlers: Array<Handler>): this {
        this.add('get', path, ...handlers);
        return this;
    }

    public post(path: string, ...handlers: Array<Handler>): this {
        this.add('post', path, ...handlers);
        return this;
    }

    public put(path: string, ...handlers: Array<Handler>): this {
        this.add('put', path, ...handlers);
        return this;
    }

    public patch(path: string, ...handlers: Array<Handler>): this {
        this.add('patch', path, ...handlers);
        return this;
    }

    public delete(path: string, ...handlers: Array<Handler>): this {
        this.add('delete', path, ...handlers);
        return this;
    }

    public head(path: string, ...handlers: Array<Handler>): this {
        this.add('head', path, ...handlers);
        return this;
    }

    public options(path: string, ...handlers: Array<Handler>): this {
        this.add('options', path, ...handlers);
        return this;
    }

    public lookup(method: string, path: string): Route<Handler> {
        Router.validateMethod(method);

        const tree = this.trees.get(method.toLowerCase());

        const route = tree?.get(path);
        if (!route) {
            throw new RouteNotFoundError(path);
        }

        return route;
    }

    public export(): Map<string, Tree<Handler>> {
        return this.trees;
    }

    // add registers a new request handler with the given path and method
    private add(method: Method, path: string, ...handlers: Array<Handler>): void {
        const _method = method.toLowerCase();

        if (path.length > 1 && path.startsWith('/')) path = path.replace('/', '');

        const tree = this.trees.get(_method);

        const fullPath = `${this.base}${this.prefix}${path}`
            .replace(/([^:])(\/\/+)/g, '$1/') // Remove duplicate forward slashes
            .replace(/\/$/, ''); // Remove trailing slashes

        tree?.add(fullPath, [...this.beforeMiddlewares, ...handlers, ...this.afterMiddlewares]);
    }
}