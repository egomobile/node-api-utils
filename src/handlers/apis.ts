// This file is part of the @egomobile/api-utils distribution.
// Copyright (c) Next.e.GO Mobile SE, Aachen, Germany (https://e-go-mobile.com/)
//
// @egomobile/api-utils is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as
// published by the Free Software Foundation, version 3.
//
// @egomobile/api-utils is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

import type { IncomingMessage, ServerResponse } from "node:http";
import { ApiResponseBuilder } from "../responses";
import type { ApiResponseBuilderFactory, AxiosClientProvider } from "../types";
import type { Nilable } from "../types/internal";

/**
 * A function, which create factory for an `IApiHandler` based instance.
 */
export type ApiHandlerFactory<THandler extends IApiHandler> =
    (options: IApiHandlerFactoryOptions) => THandler;

/**
 * An API handler method without options.
 */
export type ApiHandlerFunc<THandler extends IApiHandler> =
    (this: THandler) => PromiseLike<any>;

/**
 * An API handler method with options.
 *
 * @param {TOptions} The options.
 */
export type ApiHandlerFuncWithOptions<THandler extends IApiHandler, TOptions> =
    (this: THandler, options: TOptions) => PromiseLike<any>;

/**
 * A repository of API handler methods.
 */
export type ApiHandlerMethods<THandler extends IApiHandler> = {
    /**
     * The list of methods.
     */
    [methodName: string]: ApiHandlerFunc<THandler> | ApiHandlerFuncWithOptions<THandler, unknown>;
} & {
    // disallow the following ...
    apiResponse?: never;
    getApiClient?: never;
};

/**
 * Extended API handler with applied things like API methods.
 */
export type ExtendedApiHandler<THandler extends IApiHandler, TApiMethods extends ApiHandlerMethods<THandler>>
    = THandler & TApiMethods;

/**
 * A base type for an API handler.
 */
export interface IApiHandler {
    /**
     * Creates a new instance of `ApiResponseBuilder`, using things like
     * `request` and `response` from this instance.
     *
     * @returns {ApiResponseBuilder} The new instance.
     */
    apiResponse(): ApiResponseBuilder;
    /**
     * The function, that returns the read-to-use and authorized API client.
     */
    getApiClient: AxiosClientProvider;
    /**
     * The request context.
     */
    request: IncomingMessage;
    /**
     * The response context.
     */
    response: ServerResponse;
}

/**
 * Options for an `ApiHandlerFactory<THandler>` function.
 */
export interface IApiHandlerFactoryOptions {
    /**
     * The request context.
     */
    request: IncomingMessage;
    /**
     * The response context.
     */
    response: ServerResponse;
}

/**
 * Options for `createApiHandlerFactory()` function.
 */
export interface ICreateApiHandlerFactoryOptions<
    THandler extends IApiHandler,
    TApiMethods extends ApiHandlerMethods<THandler>
> {
    /**
     * A custom function, creating a `ApiResponseBuilder` instance.
     */
    createApiResponse?: Nilable<ApiResponseBuilderFactory>;
    /**
     * The function, that returns the API client.
     */
    getApiClient: AxiosClientProvider;
    /**
     * The list of methods to add.
     */
    methods: TApiMethods;
}

/**
 * Creates a factory function, which is able to create a strong typed `IApiHandler` based
 * instance.
 *
 * @example
 * ```
 * // `npm i axios`
 * import type { AxiosInstance } from "axios"
 * import { createApiHandlerFactory, IApiHandler } from "@egomobile/api-utils"
 * import { createServer, params } from "@egomobile/http-server"
 *
 * interface IGetUserByIdOptions {
 *   userId: string;
 * }
 *
 * async function getApiClient(): Promise<AxiosInstance> {
 *   // return an `AxiosInstance` instance here
 *   // which is already authenticated
 *   // and ready-to-use
 * }
 *
 * async function getAllUsers(this: IApiHandler): Promise<void> {
 *   const {
 *     getApiClient,
 *     request, response
 *   } = this
 *
 *   // ...
 *
 *   this.apiResponse()
 *     // ... do some more operations here
 *     .send()
 * }
 *
 * async function getUserById(this: IApiHandler, options: IGetUserByIdOptions): Promise<void> {
 *   const {
 *     getApiClient,
 *     request, response
 *   } = this
 *
 *   const {
 *     user
 *   } = options
 *
 *   // ...
 *
 *   this.apiResponse()
 *     // ... do some more operations here
 *     .send()
 * }
 *
 * const createApiHandler = createApiHandlerFactory({
 *   getApiClient,
 *
 *   "methods": {
 *     getAllUsers,
 *     getUserById
 *   }
 * })
 *
 * const app = createServer()
 *
 * app.get("/users", async (request, response) => {
 *   const newHandler = createApiHandler({
 *     request, response
 *   })
 *
 *   await newHandler.getAllUsers()
 * })
 *
 * app.get(params("/users/:user_id", async (request, response) => {
 *   const newHandler = createApiHandler({
 *     request, response
 *   })
 *
 *   await newHandler.getUserById({
 *     userId: request.params!.user_id
 *   })
 * })
 *
 * await app.listen()
 * ```
 *
 * @param {ICreateApiHandlerFactoryOptions<THandler,TApiMethods>} options The options.
 *
 * @returns {ApiHandlerFactory<ExtendedApiHandler<THandler,TApiMethods>>} The new function.
 */
export function createApiHandlerFactory<
    THandler extends IApiHandler,
    TApiMethods extends ApiHandlerMethods<THandler>,
>(
    options: ICreateApiHandlerFactoryOptions<THandler, TApiMethods>
): ApiHandlerFactory<ExtendedApiHandler<THandler, TApiMethods>> {
    const {
        getApiClient,
        methods
    } = options;

    const createApiResponse = options.createApiResponse ?? (({
        request, response
    }) => {
        return new ApiResponseBuilder({
            request, response
        });
    });

    return ({
        request,
        response
    }) => {
        const newHandler = ({
            "apiResponse": () => {
                return createApiResponse({
                    request,
                    response
                });
            },
            getApiClient,
            request, response
        } as IApiHandler) as unknown as ExtendedApiHandler<THandler, TApiMethods>;

        // apply methods
        Object.entries(methods).map(([methodName, methodFunc]) => {
            (newHandler as any)[methodName] = methodFunc.bind(newHandler);
        });

        return newHandler;
    };
}

