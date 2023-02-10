export class WildcardError extends Error {
    constructor(message: string) {
        super(message);

        this.name = this.constructor.name;
    }
}
export class WildcardConflictError extends Error {
    constructor(pathSegment: string, fullPath: string, path: string, prefix: string) {
        super(`${pathSegment} in new path: ${fullPath}, conflicts with existing wildcard: ${path}, in existing prefix: ${prefix}`);

        this.name = this.constructor.name;
    }
}

export class NodeExistsError extends Error {
    constructor(fullPath: string) {
        super(`A node is already registered for this path: ${fullPath}`);
    }
}