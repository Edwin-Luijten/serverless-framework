import { Node } from './node';

export type Route<Handler> = {
    path: string;
    handlers: Array<Handler>;
    params: Record<string, string>;
}

export class Tree<Handler> {
    private readonly _root: Node<Handler>;

    public constructor(protected method: string) {
        this._root = new Node<Handler>();
    }

    public get root(): Node<Handler> {
        return this._root;
    }

    public add(path: string, handlers: Array<Handler>) {
        this._root.set(path, ...handlers);
    }

    public get(path: string): Route<Handler> | undefined {
        const {handlers, params} = this._root.get(path);

        if (handlers === null) return undefined;

        return {
            path: path,
            params: params,
            handlers: handlers,
        }
    }
}