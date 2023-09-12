import { Tree } from '../../../src/radix/tree';
import { Node } from '../../../src/radix/node';
import { NodeExistsError, WildcardError, WildcardConflictError } from '../../../src/radix/error';

describe('Tree', () => {
    it('There should always be a root node', () => {
        const tree = new Tree('get');
        const root = tree.root

        expect(root).toBeInstanceOf(Node);
    });

    it('should be possible to add new entries', () => {
        const tree = new Tree('get');
        tree.add('/blog', [() => {}]);
        tree.add('/blog/:slug', [() => {}]);
        tree.add('/blog/:slug/comments', [() => {}]);

        expect(tree.root.priority).toEqual(3);
    });

    it('order should be based on priority', () => {
        const tree = new Tree('get');
        tree.add('/1', [() => {}]);
        tree.add('/2', [() => {}]);
        tree.add('/2/3', [() => {}]);

        expect(tree.root.priority).toEqual(3);
        expect(tree.root.children[1].path).toEqual('1');
        expect(tree.root.children[0].path).toEqual('2');
        expect(tree.root.children[0].children[0].path).toEqual('/3');
    });

    it('should match with similar paths', () => {
        const tree = new Tree('get');
        tree.add('/test1', [() => {}]);
        tree.add('/test2', [() => {}]);

        const routeA = tree.get('/test1');
        const routeB = tree.get('/test2');
        expect(routeA).not.toBeUndefined();
        expect(routeB).not.toBeUndefined();
    });

    it('should return the path parameters', () => {
        const tree = new Tree('get');
        tree.add('/blog', [() => {}]);
        tree.add('/blog/:slug', [() => {}]);
        tree.add('/blog/:slug/comments/:commentId', [() => {}]);

        expect(tree.get('/blog')).toEqual({path: '/blog', params: {}, handlers: expect.arrayContaining([expect.any(Function)])});
        expect(tree.get('/blog/foo')).toEqual({path: '/blog/foo', params: {slug: 'foo'}, handlers: expect.arrayContaining([expect.any(Function)])});
        expect(tree.get('/blog/foo/comments/1')).toEqual({path: '/blog/foo/comments/1', params: {slug: 'foo', commentId: '1'}, handlers: expect.arrayContaining([expect.any(Function)])});
    });

    it('should find a wildcard route', () => {
        const tree = new Tree('get');
        tree.add('/blog/*foo', [() => {}]);

        expect(tree.get('/blog/foo')).toEqual({path: '/blog/foo', params: {foo: '/foo'}, handlers: expect.arrayContaining([expect.any(Function)])});
        expect(tree.get('/blog/foo/comments/1')).toEqual({path: '/blog/foo/comments/1', params: {foo: '/foo/comments/1'}, handlers: expect.arrayContaining([expect.any(Function)])});
    });

    it('should throw an error on adding a duplicate node', () => {
        const tree = new Tree('get');

        expect(() => {
            tree.add('/blog/:slug', [() => {}]);
            tree.add('/blog/:slug', [() => {}]);
        }).toThrow(NodeExistsError);
    });

    it('should throw an error on adding a duplicate node', () => {
        const tree = new Tree('get');

        expect(() => {
            tree.add('/blog/:slug', [() => {}]);
            tree.add('/blog/:slug', [() => {}]);
        }).toThrow(NodeExistsError);
    });

    it('should throw an error adding a wildcard not at the end', () => {
        const tree = new Tree('get');

        expect(() => tree.add('/blog/*bar/+bar', [() => {}])).toThrow(WildcardError);
    });

    it('should throw an error adding a wildcard not starting with a slash', () => {
        const tree = new Tree('get');

        expect(() => tree.add('/blog*bar', [() => {}])).toThrow('no / before catch all in path');
        expect(() => tree.add('*bar', [() => {}])).toThrow('no / before catch all in path');
    });

    it('should throw an error adding a wildcard after an existing handler on the same segment', () => {
        const tree = new Tree('get');

        expect(() => {
            tree.add('/blog/foo', [() => {}]);
            tree.add('/blog/*bar', [() => {}]);
        }).toThrow('Catch-all conflicts with existing handler for the path segment in path: /blog/*bar');
    });

    it('should throw an error adding a conflicting wildcard', () => {
        const tree = new Tree('get');

        expect(() => {
            tree.add('/blog/:bar/bar', [() => {}])
            tree.add('/blog/*bar', [() => {}])
        }).toThrow(WildcardConflictError);
    });
});