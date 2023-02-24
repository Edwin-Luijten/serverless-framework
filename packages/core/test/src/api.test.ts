import { req } from './req';
import { res } from './res';

import { BaseApi, RequestInterface, ResponseInterface, HttpStatusCode } from '../../src';

const api = new BaseApi({
    base: '/api',
});

const videos = (api: BaseApi) => {
    api.get('/', (req: RequestInterface, res: ResponseInterface) => {
        res.sendStatus(HttpStatusCode.OK);
    });

    api.get('/:id', (req: RequestInterface, res: ResponseInterface) => {
        res.sendStatus(HttpStatusCode.OK);
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
});