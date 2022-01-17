import type { IApiListQuery } from './src/requests';

declare module 'http' {
    export interface IncomingMessage {
        /**
         * Object created by middleware, created by
         * 'parseListQuery()' function.
         */
        listQuery?: IApiListQuery;
    }
}
