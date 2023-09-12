import { encodeBody } from '../../src';

describe('Encode', () => {
    it('It should encode object to json', async () => {
        const str = encodeBody({foo: 'bar'});

        expect(str).toEqual('{"foo":"bar"}')
    });

    it('It should encode numbers to json', async () => {
        [0, 1.2, 1000, -1, -2, Number(1000)].forEach(n => {
            const str = encodeBody(n);

            expect(str).toEqual(n.toString());
        });
    });

    it('It should encode strings to json', async () => {
        ['foo', 'i\'m a frog', String('bar')].forEach(n => {
            const str = encodeBody(n);

            expect(str).toEqual(n);
        });
    });

    it('It should encode dates to json', async () => {
        [new Date()].forEach(n => {
            const str = encodeBody(n);

            expect(str).toEqual(JSON.stringify(n));
        });
    });

    it('It should encode arrays to json', async () => {
        [[1, 2], ['foo', 'bar']].forEach(n => {
            const str = encodeBody(n);

            expect(str).toEqual(JSON.stringify(n));
        });
    });

    it('It should encode undefined to empty string', async () => {
        [undefined].forEach(n => {
            const str = encodeBody(n);

            expect(str).toEqual('');
        });
    });
});