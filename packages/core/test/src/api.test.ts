import { req } from './req';
import { res } from './res';

import { BaseApi, RequestInterface, ResponseInterface, HttpStatusCode, NextFunction } from '../../src';

const api = new BaseApi({
    base: '/api',
});

api.use((req: RequestInterface, res: ResponseInterface, next?: NextFunction) => {
    res.setHeader('a', 'b');

    if (next) next();
});

api.get('/version', (req: RequestInterface, res: ResponseInterface) => {
    res.json({version: 1});
});


const videos = (api: BaseApi) => {
    api.get('/', (req: RequestInterface, res: ResponseInterface) => {
        res.sendStatus(HttpStatusCode.OK);
    });

    api.get('/:id', (req: RequestInterface<{ id: string }, { foo: string }, { bar: string }>, res: ResponseInterface) => {
        res.status(HttpStatusCode.OK).json({
            id: req.params.id,
            query: req.query.foo,
            body: req.body.bar,
        });
    });
}

const content = (api: BaseApi) => {
    api.get('/', (req: RequestInterface, res: ResponseInterface) => {
        res.sendStatus(HttpStatusCode.OK);
    });

    api.get('/menu', (req: RequestInterface, res: ResponseInterface) => {
        res.sendStatus(HttpStatusCode.OK);
    });

    api.group('/videos', videos);
};

api.group('/content', content);

const resp = res(req);

describe('Group', () => {
    it('It should be able to create groups', async () => {
        for (const path of ['/api/content', '/api/content/menu']) {
            req.path = path;
            req.method = 'get';

            const _resp = await api.handle(req, resp);

            expect(_resp.status).toEqual(HttpStatusCode.OK);
            expect(resp.statusCode).toEqual(HttpStatusCode.OK);
        }
    });

    it('It should be able to create nested groups', async () => {
        for (const path of ['/api/content/videos', '/api/content/videos/1']) {
            req.path = path;
            req.method = 'get';

            const _resp = await api.handle(req, resp);

            expect(_resp.status).toEqual(HttpStatusCode.OK);
            expect(resp.statusCode).toEqual(HttpStatusCode.OK);
        }
    });

    it('It should be able to create middlewares', async () => {
        req.path = '/api/version';
        req.method = 'get';
        const _resp = await api.handle(req, resp);

        expect(_resp.status).toEqual(HttpStatusCode.OK);
        expect(resp.statusCode).toEqual(HttpStatusCode.OK);

        // the middleware adds a header to the response
        expect(resp.headers['a']).toEqual(['b']);
    });

    it('It should be able to call an any route with any method', async () => {
        api.any('/any', (req: RequestInterface, res: ResponseInterface) => {
            res.json({version: 1});
        });

        req.path = '/api/any';
        for (const method of ['get', 'post', 'put', 'delete', 'patch']) {
            req.method = method;
            const _resp = await api.handle(req, resp);

            expect(_resp.status).toEqual(HttpStatusCode.OK);
            expect(resp.statusCode).toEqual(HttpStatusCode.OK);
        }
    });

    it('It should be able to register default methods', async () => {
        for (const method of ['get', 'post', 'put', 'delete', 'patch']) {
            api[method](`/method/${method}`, (req: RequestInterface, res: ResponseInterface) => {
                res.json({version: 1});
            });

            req.path = `/api/method/${method}`;
            req.method = method;
            const _resp = await api.handle(req, resp);

            expect(_resp.status).toEqual(HttpStatusCode.OK);
            expect(resp.statusCode).toEqual(HttpStatusCode.OK);
        }
    });

    it('It return an empty body on head method', async () => {
        api.head('/head', (req: RequestInterface, res: ResponseInterface) => {
            res.json({version: 1});
        });

        req.path = `/api/head`;
        req.method = 'head';
        const _resp = await api.handle(req, resp);

        expect(_resp.status).toEqual(HttpStatusCode.OK);
        expect(resp.statusCode).toEqual(HttpStatusCode.OK);
        expect(_resp.body).toEqual('')
    });

    it('It return a 404 on route not found', async () => {
        req.path = `/api/xyz`;
        req.method = 'get';

        const _resp = await api.handle(req, resp);

        expect(_resp.status).toEqual(HttpStatusCode.NOT_FOUND);
        expect(resp.statusCode).toEqual(HttpStatusCode.NOT_FOUND);
    });
});