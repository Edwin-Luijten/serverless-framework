import { InvalidMethodError, RouteNotFoundError, Router } from '../../src';
import { WildcardError } from '../../src/radix/error';
import routes from './routes.json';

type RequestHandler = () => any;

describe('Router', () => {
    it('should throw an error on an invalid method', () => {
        const router = new Router<RequestHandler>();
        router.get('/blog', () => {});

        expect(() => router.lookup('foo', '/blog')).toThrow(InvalidMethodError);
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
        router.get('/blog', () => {});
        router.get('/blog/:slug', () => {});
        router.get('/blog/:slug/comments', () => {});
        router.get('/blog/:slug/comments/:id', () => {});
        router.get('/blog/:slug/images/*image', () => {});

        expect(router.export().get('get')?.root?.priority).toEqual(5);

        let route = router.lookup('get', '/blog/foo');
        expect(route.path).toEqual('/blog/foo');

        route = router.lookup('get', '/blog/foo');
        expect(route.path).toEqual('/blog/foo');
        expect(route.params?.slug).toEqual('foo');

        route = router.lookup('get', '/blog/foo/comments');
        expect(route.path).toEqual('/blog/foo/comments');
        expect(route.params?.slug).toEqual('foo');

        route = router.lookup('get', '/blog/foo/comments/1');
        expect(route.path).toEqual('/blog/foo/comments/1');
        expect(route.params?.slug).toEqual('foo');
        expect(route.params?.id).toEqual('1');

        route = router.lookup('get', '/blog/foo/images/theme/default/header.png');
        expect(route.path).toEqual('/blog/foo/images/theme/default/header.png');
        expect(route.params?.slug).toEqual('foo');
        expect(route.params?.image).toEqual('/theme/default/header.png');
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