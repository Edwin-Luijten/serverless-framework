import { Tree } from '../../../src/radix/tree';

describe('Tree', () => {
    it('should be possible to add new entries', () => {
        const tree = new Tree('get');
        tree.add('/blog', [() => {}]);
        tree.add('/blog/:slug', [() => {}]);
        tree.add('/blog/:slug/comments', [() => {}]);

        expect(tree.root?.priority).toEqual(3);
    });

    it('order should be based on priority', () => {
        const tree = new Tree('get');
        tree.add('/1', [() => {}]);
        tree.add('/2', [() => {}]);
        tree.add('/2/3', [() => {}]);

        expect(tree.root?.priority).toEqual(3);
        expect(tree.root?.children[1].path).toEqual('1');
        expect(tree.root?.children[0].path).toEqual('2');
        expect(tree.root?.children[0].children[0].path).toEqual('/3');
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
});