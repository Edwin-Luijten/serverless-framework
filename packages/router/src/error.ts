
export class MethodNotAllowedError extends Error {
    constructor(method?: string, allowed?: string) {
        if (method && allowed) super(`invalid method: ${method}, use one of: ${allowed}`);
        else super('method not allowed');

        this.name = this.constructor.name;
    }
}

export class RouteNotFoundError extends Error {
    constructor(path: string) {
        super(`route not found: ${path}`);

        this.name = this.constructor.name;
    }
}
