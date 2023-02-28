import { decodeBody, encodeBody } from '../../src';

describe('Decode', () => {
    it('It should decode objects', async () => {
        const original = {foo: 'bar'};
        const str = encodeBody(original);

        expect(decodeBody(str)).toEqual(original);
    });

    it('It should decode dates', async () => {
        const original = new Date();
        const str = encodeBody(original);

        expect(decodeBody(str)).toEqual(original.toISOString());
    });

    it('It should decode arrays', async () => {
        const original = [1, 'foo'];
        const str = encodeBody(original);

        expect(decodeBody(str)).toEqual(original);
    });

    it('It should return original string on invalid json', async () => {
        const original = '{foo: bar}';
        const str = encodeBody(original);

        expect(decodeBody(str)).toEqual(original);
    });
});