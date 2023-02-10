import { Node } from './node';

export type Route<Handler> = {
    path: string;
    handlers: Array<Handler>;
    params: Record<string, string>;
}

export class Tree<Handler> {
    private _root: Node<Handler> | undefined;

    public constructor(protected method: string) {

    }

    public get root(): Node<Handler> {
        if (!this._root) this._root = new Node<Handler>();
        return this._root;
    }

    public add(path: string, handlers: Array<Handler>) {
        if (!this._root) this._root = new Node<Handler>();
        this._root.set(path, ...handlers);
    }

    public get(path: string): Route<Handler> | undefined {
        if (!this._root) this._root = new Node<Handler>();
        const {handlers, params} = this._root.get(path);

        if (handlers === null) return undefined;

        return {
            path: path,
            params: params,
            handlers: handlers,
        }
    }
}