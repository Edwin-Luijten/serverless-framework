import { NodeExistsError, WildcardConflictError, WildcardError } from './error';

enum NodeType {
    Static = 0,
    Root = 1,
    Parameter = 2,
    CatchAll = 3,
}

const enum CharCode {
    WildCard = 42,
    Slash = 47,
    Colon = 58,
}

export class Node<Handler> {
    public type: number = NodeType.Static;
    public indices: string = '';
    public path: string = '';
    public priority = 0;
    public wildcardChild: boolean = false;
    public handlers: Array<Handler> = [];
    public children: Array<Node<Handler>> = [];

    public constructor(type: number = NodeType.Static, path: string = '', indices: string = '', priority: number = 0, ...handlers: Array<Handler>) {
        this.type = type;
        this.path = path;

        this.indices = indices;
        this.priority = priority;
        this.handlers = handlers;
    }

    public set(path: string, ...handlers: Array<Handler>): Node<Handler> {
        let node: Node<Handler> = this;

        const fullPath = path;
        node.priority++;

        if (node.path.length === 0 && node.children.length === 0) {
            node.insert(path, fullPath, handlers);
            node.type = NodeType.Root;

            return this;
        }

        walk: while (true) {
            const prefixIndex = this.longestCommonPrefixIndex(path, node.path);

            if (prefixIndex < node.path.length) {
                const child = new Node<Handler>(NodeType.Static, node.path.slice(prefixIndex), node.indices, node.priority - 1, ...node.handlers);
                child.wildcardChild = node.wildcardChild;
                child.children = node.children;

                node.children = [child];
                node.indices = node.path[prefixIndex];
                node.path = path.slice(0, prefixIndex);
                node.handlers = [];
                node.wildcardChild = false;
            }

            if (prefixIndex < path.length) {
                path = path.slice(prefixIndex);
                const char = path.charCodeAt(0);

                // slash after the parameter
                if (node.type === NodeType.Parameter && char === CharCode.Slash && node.children.length === 1) {
                    node = node.children[0];
                    node.priority++;
                    continue;
                }

                for (let ind = 0; ind < node.indices.length; ind++) {
                    if (char === node.indices.charCodeAt(ind)) {
                        ind = node.promoteChild(ind);
                        node = node.children[ind];
                        continue walk;
                    }
                }

                if (char !== CharCode.Colon && char !== CharCode.WildCard && NodeType.CatchAll) {
                    node.indices += String.fromCharCode(char);
                    const child = node.append(new Node<Handler>(NodeType.Static, '', '', 0));
                    node.promoteChild(node.indices.length - 1);
                    node = child;
                } else if (node.wildcardChild) {
                    node = node.children[node.children.length - 1];
                    node.priority++;

                    if (path.length >= node.path.length &&
                        node.path === path.slice(0, node.path.length) &&
                        node.type !== NodeType.CatchAll &&
                        node.path.length >= path.length || path.charCodeAt(node.path.length) === CharCode.Slash
                    ) {
                        continue;
                    }

                    let pathSegment = path;
                    if (node.type !== NodeType.CatchAll) {
                        const idx = path.indexOf('/');
                        if (idx === -1) pathSegment = path;
                        else pathSegment = path.substring(0, idx);
                    }

                    const prefix = fullPath.slice(0, fullPath.indexOf(pathSegment)) + node.path;
                    throw new WildcardConflictError(pathSegment, fullPath, path, prefix);
                }

                node.insert(path, fullPath, handlers);
                return this;
            }

            if (node.handlers.length) {
                throw new NodeExistsError(fullPath);
            }

            node.handlers = handlers;
            return this;
        }
    }

    public get(path: string): { params: { [key: string]: string }; handlers: Array<Handler> | null; } {
        let node: Node<Handler> = this;
        let handlers = null;
        const params = {};

        walk: while (true) {
            if (path.length > node.path.length) {
                if (path.slice(0, node.path.length) === node.path) {
                    path = path.slice(node.path.length);
                    const char = path.charCodeAt(0);

                    for (let i = 0; i < node.indices.length; i++) {
                        if (char === node.indices.charCodeAt(i)) {
                            node = node.children[i];
                            continue walk;
                        }
                    }

                    if (!node.wildcardChild) {
                        return {handlers, params};
                    }

                    node = node.children[node.children.length - 1];
                    let end = 0;

                    switch (node.type) {
                        case NodeType.Parameter:
                            // Find end of parameter
                            while (end < path.length && path.charCodeAt(end) !== CharCode.Slash) {
                                end++;
                            }

                            params[node.path.slice(1)] = path.slice(0, end);

                            if (end < path.length) {
                                if (node.children.length > 0) {
                                    path = path.slice(end);
                                    node = node.children[0];
                                    continue;
                                }

                                return {handlers, params};
                            }

                            handlers = node.handlers;
                            return {handlers, params};
                        case NodeType.CatchAll:
                            params[node.path.slice(2)] = path;
                            handlers = node.handlers;

                            return {handlers, params};
                        default:
                            throw new Error(`invalid node type ${node.type}`);
                    }
                }
            } else if (path === node.path) {
                handlers = node.handlers
            }

            return {handlers, params};
        }
    }

    public append(node: Node<Handler>): Node<Handler> {
        if (this.wildcardChild && this.children.length > 0) {
            this.children.splice(-1, 0, node);
        } else {
            this.children.push(node);
        }

        return node;
    }

    public promoteChild(position: number): number {
        const children = this.children;
        children[position].priority++;

        const priority = children[position].priority;
        let newPosition = position;

        for (; newPosition > 0 && children[newPosition - 1].priority < priority; newPosition--) {
            // swap positions
            [children[newPosition - 1], children[newPosition]] = [children[newPosition], children[newPosition - 1]];
        }

        if (newPosition !== position) {
            this.indices = this.indices.slice(0, newPosition) +
                this.indices[position] +
                this.indices.slice(newPosition, position) +
                this.indices.slice(position + 1);
        }

        return newPosition;
    }

    private findWildcard(path: string): { wildcard: string; i: number; valid: boolean } {
        for (let i = 0; i < path.length; i++) {
            let char = path.charCodeAt(i);
            if (char !== CharCode.Colon && char !== CharCode.WildCard) {
                continue;
            }

            let valid = true;
            const rest = path.slice(i + 1);

            for (let end = 0; end < rest.length; end++) {
                const char = rest.charCodeAt(end);
                if (char === CharCode.Slash) {
                    return {
                        wildcard: path.slice(i, i + 1 + end), i, valid,
                    }
                }

                if (char === CharCode.Colon || char === CharCode.WildCard) {
                    valid = false;
                }
            }

            return {
                wildcard: path.slice(i), i, valid,
            }
        }

        return {
            wildcard: '', i: -1, valid: false,
        }
    }

    private insert(path: string, fullPath: string, handlers: Array<Handler>): void {
        let node: Node<Handler> = this;

        while (true) {
            // Find prefix till first wildcard
            const result = this.findWildcard(path);
            const {wildcard, valid} = result;

            let {i} = result;
            if (i < 0) {
                break;
            }

            // The wildcard cannot contain : and *
            if (!valid) {
                throw new WildcardError(`Only one wildcard per path segment is allowed, found: ${wildcard} in path: ${fullPath}`);
            }

            if (wildcard.length < 2) {
                throw new WildcardError(`Wildcards must be named with a non-empty name in path: ${fullPath}`);
            }

            if (wildcard.charCodeAt(0) === CharCode.Colon) {
                if (i > 0) {
                    node.path = path.slice(0, i);
                    path = path.slice(i);
                }

                const child = node.append(new Node<Handler>(NodeType.Parameter, wildcard, '', 1));
                node.wildcardChild = true;
                node = child;

                if (wildcard.length < path.length) {
                    path = path.slice(wildcard.length);
                    node = node.append(new Node<Handler>(NodeType.Static, '', '', 1));
                    continue;
                }

                node.handlers = handlers;
                return
            }

            if (i + wildcard.length !== path.length) {
                throw new WildcardError(`Catch-all routes are only allowed at the end of the path: ${fullPath}`);
            }

            if (node.path.length > 0 && node.path.charCodeAt(node.path.length - 1) === CharCode.Slash) {
                throw new WildcardError(`Catch-all conflicts with existing handler for the path segment in path: ${fullPath}`);
            }

            i--;

            if (path.charCodeAt(i) !== CharCode.Slash) {
                throw new Error('no / before catch all in path');
            }

            node.path = path.slice(0, i);

            const catchAllChild = node.append(new Node<Handler>(NodeType.CatchAll, '', '', 1));
            catchAllChild.wildcardChild = true;

            node.indices = '/';
            node = catchAllChild;

            node.append(new Node<Handler>(NodeType.CatchAll, path.slice(i), fullPath, 1, ...handlers));
            return;
        }

        node.path = path;
        node.handlers = handlers;
    }

    private longestCommonPrefixIndex(a: string, b: string): number {
        let i = 0;
        const max = Math.min(a.length, b.length);
        while (i < max && a[i] === b[i]) i++;

        return i;
    }
}