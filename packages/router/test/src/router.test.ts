import { RouteNotFoundError, MethodNotAllowedError, Router } from '../../src';
import { WildcardError } from '../../src/radix/error';
import routes from './routes.json';

type RequestHandler = () => any;

describe('Router', () => {
    it('should add an ending slash when none provided', () => {
        const router = new Router<RequestHandler>('/api');
        router.get('/foo');
        const route = router.lookup('get', '/api/foo');
        expect(route.path).toEqual('/api/foo');
    });

    it('should throw an error on an invalid method', () => {
        const router = new Router<RequestHandler>();
        router.get('/blog', () => {});

        expect(() => router.lookup('foo', '/blog')).toThrow(MethodNotAllowedError);
    });

    it('should be able to set method not allowed alternative message', () => {
        expect(() => {throw new MethodNotAllowedError()}).toThrow('method not allowed');
        expect(() => {throw new MethodNotAllowedError('get', 'post')}).toThrow('invalid method: get, use one of: post');
    });

    it('should throw an error on route not found', () => {
        const router = new Router<RequestHandler>();
        router.get('/foo', () => {});

        expect(() => router.lookup('get', '/bar')).toThrow(RouteNotFoundError);
    });

    it('should throw an error when encountering conflicting wildcard', () => {
        const router = new Router<RequestHandler>();
        expect(() => router.get('/blog/:slug/images/*image/test', () => {})).toThrow(WildcardError);
    })

    it('should be possible to add new entries', () => {
        const router = new Router<RequestHandler>();
        for (const method of ['get', 'post', 'put', 'patch', 'delete', 'head', 'any', 'options']) {
            router[method]('/blog', () => {});

            let route = router.lookup(method, '/blog');
            expect(route.path).toEqual('/blog');
        }
    });

    it('should be possible to add new groups', () => {
        const router = new Router<RequestHandler>();
        router.group('blog', (blog: Router<RequestHandler>) => {
            blog.get('', () => {});
            blog.get('/:slug', () => {});
            blog.get('/:slug/comments', () => {});
        });

        expect(router.export().get('get')?.root?.priority).toEqual(3);

        let route = router.lookup('get', '/blog');
        expect(route.path).toEqual('/blog');
        expect(route.handlers.length).toEqual(1);

        route = router.lookup('get', '/blog/foo');
        expect(route.path).toEqual('/blog/foo');
        expect(route.handlers.length).toEqual(1);

        route = router.lookup('get', '/blog/foo/comments');
        expect(route.path).toEqual('/blog/foo/comments');
        expect(route.handlers.length).toEqual(1);
    });

    it('should be possible to add middlewares per route', () => {
        const router = new Router<RequestHandler>();
        router.get('blog/:slug', () => {}, () => {}, () => {});

        const route = router.lookup('get', '/blog/foo');
        expect(route.path).toEqual('/blog/foo');
        expect(route.handlers.length).toEqual(3);
    });

    it('should be possible to set before and after middlewares', () => {
        const router = new Router<RequestHandler>();
        router.applyBeforeMiddlewares([() => {}]);
        router.applyAfterMiddlewares([() => {}]);

        router.get('/blog/foo', () => {});

        const route = router.lookup('get', '/blog/foo');
        expect(route.path).toEqual('/blog/foo');
        expect(route.handlers.length).toEqual(3);
    });

    it('should be possible to remove before and after middlewares', () => {
        const router = new Router<RequestHandler>();
        router.applyBeforeMiddlewares([() => {}]);
        router.applyAfterMiddlewares([() => {}]);

        router.removeBeforeMiddlewares();
        router.removeAfterMiddlewares();

        router.get('/blog/foo', () => {});

        const route = router.lookup('get', '/blog/foo');
        expect(route.path).toEqual('/blog/foo');
        expect(route.handlers.length).toEqual(1);
    });

    it('should be possible to add middlewares per group', () => {
        const router = new Router<RequestHandler>();
        router.group('blog', (blog: Router<RequestHandler>) => {
            blog.get('', () => {});
            blog.get('/:slug', () => {});
            blog.get('/:slug/comments', () => {});
        }, [() => {}], [() => {}]);

        expect(router.export().get('get')?.root?.priority).toEqual(3);

        const route = router.lookup('get', '/blog/foo');
        expect(route.path).toEqual('/blog/foo');
        expect(route.handlers.length).toEqual(3);
    });

    it('should be possible to add middlewares per route in a group', () => {
        const router = new Router<RequestHandler>();
        router.group('blog', (blog: Router<RequestHandler>) => {
            blog.get('', () => {});
            blog.get('/:slug', () => {}, () => {}, () => {});
            blog.get('/:slug/comments', () => {});
        });

        expect(router.export().get('get')?.root?.priority).toEqual(3);

        let route = router.lookup('get', '/blog/foo');
        expect(route.path).toEqual('/blog/foo');
        expect(route.handlers.length).toEqual(3);

        route = router.lookup('get', '/blog/foo/comments');
        expect(route.path).toEqual('/blog/foo/comments');
        expect(route.handlers.length).toEqual(1);
    });

    it('parse the github api routes', () => {
        const router = new Router<RequestHandler>();
        routes.forEach(route => {
            router[route[0].toLowerCase()](route[1], () => {
                return route[1];
            });
        });

        routes.forEach(route => {
            const match = router.lookup(route[0], route[2]);
            expect(match.handlers.length).toEqual(1);
            expect(match.handlers[0]()).toEqual(route[1]);
        });
    });
});