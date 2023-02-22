import v1Event from '../events/event-apigateway-v1.json';
import v2Event from '../events/event-apigateway-v2.json';
import { eventTransformer } from '../../src/event-transformer';
import { APIGatewayProxyEvent, APIGatewayProxyEventV2 } from 'aws-lambda';

describe('Requests', () => {
    it('It should parse an incoming apigateway v1 event', async () => {
        const req = eventTransformer(v1Event as unknown as APIGatewayProxyEvent);

        expect(req).toEqual({
            path: '/api/version',
            method: 'GET',
            headers: {
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'accept-encoding': 'gzip, deflate, lzma, sdch, br',
                'accept-language': 'en-US,en;q=0.8',
                'cloudfront-forwarded-proto': 'https',
                'cloudfront-is-desktop-viewer': 'true',
                'cloudfront-is-mobile-viewer': 'false',
                'cloudfront-is-smarttv-viewer': 'false',
                'cloudfront-is-tablet-viewer': 'false',
                'cloudfront-viewer-country': 'US',
                'host': 'localhost:4566',
                'upgrade-insecure-requests': '1',
                'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
                'via': '1.1 fb7cca60f0ecd82ce07790c9c5eef16c.cloudfront.net (CloudFront)',
                'x-amz-cf-id': 'nBsWBOrSHMgnaROZJK1wGCZ9PcRcSpq_oSXZNQwQ10OTZL4cimZo3g==',
                'x-forwarded-for': '172.22.0.1, localhost:4566',
                'x-forwarded-port': '443',
                'x-forwarded-proto': 'https',
                'content-type': 'application/json',
            },
            cookies: {},
            context: {},
            clientCountry: undefined,
            isBase64Encoded: false,
            ip: '172.22.0.1',
            params: {},
            query: {},
            userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
            body: '',
        });
    });

    it('It should parse an incoming apigateway v2 event', () => {
        const req = eventTransformer(v2Event as unknown as APIGatewayProxyEventV2);

        expect(req).toEqual({
            path: '/api/version',
            method: 'GET',
            headers: {
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'accept-encoding': 'gzip, deflate, br',
                'accept-language': 'en-US,en;q=0.9',
                'content-length': '0',
                'host': 'r3pmxmplak.execute-api.us-east-2.amazonaws.com',
                'upgrade-insecure-requests': '1',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36',
                'x-amzn-trace-id': 'Root=1-5e6722a7-cc56xmpl46db7ae02d4da47e',
                'x-forwarded-for': '205.255.255.176',
                'x-forwarded-port': '443',
                'x-forwarded-proto': 'https',
                'sec-fetch-dest': 'document',
                'sec-fetch-mode': 'navigate',
                'sec-fetch-site': 'cross-site',
                'sec-fetch-user': '?1',
                'content-type': 'application/json',
            },
            cookies: {
                regStatus: 'pre-register',
                s_fid: '7AABXMPL1AFD9BBF-0643XMPL09956DE2',
            },
            context: {},
            clientCountry: undefined,
            isBase64Encoded: true,
            ip: '205.255.255.176',
            params: {},
            query: {},
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36',
            body: '',
        });
    });
});