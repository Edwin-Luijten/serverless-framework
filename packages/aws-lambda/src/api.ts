import {
    ApiInterface,
    ApiOptions,
    BaseApi,
    Response,
    ResponseInterface
} from '../../core';
import { APIGatewayProxyEvent, APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { eventTransformer } from './event-transformer';
import { responseTransformer } from './response-transformer';

export class Api extends BaseApi implements ApiInterface {
    constructor(options?: ApiOptions) {
        super(options);
    }

    public async run(event: APIGatewayProxyEvent | APIGatewayProxyEventV2, context?: Context): Promise<any> {
        // transform request
        const req = eventTransformer(event);

        // transform context
        req.context = context ? Object.keys(context).reduce(
            (acc, key) =>
                Object.assign(acc, {[key.toLowerCase()]: context[key]}),
            {}
        ) : undefined;

        // setup response
        const res: ResponseInterface = new Response(req, responseTransformer);

        return this.handle(req, res);
    }
}