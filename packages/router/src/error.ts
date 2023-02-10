export class InvalidMethodError extends Error {
    constructor(method: string, allowed: string) {
        super(`invalid method: ${method}, use one of: ${allowed}`);

        this.name = this.constructor.name;
    }
}

export class MethodNotAllowedError extends Error {
    constructor() {
        super('method not allowed');

        this.name = this.constructor.name;
    }
}

export class RouteNotFoundError extends Error {
    constructor(path: string) {
        super(`route not found: ${path}`);

        this.name = this.constructor.name;
    }
}
