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

import type { ControllerMethodInitializedEventHandler, HttpOptionsOrMiddlewares, HttpRequestHandler, HttpRequestPath, IControllerMethodInfo, IControllersOptions, IControllersResult, IHttpServer } from "@egomobile/http-server";
import { apiResponse } from "../responses";
import type { Nilable } from "../types/internal";

/**
 * Result of a `createSwaggerStatSettings()` call.
 */
export interface ICreateSwaggerStatSettingsResult {
    /**
     * The handler.
     */
    handler: HttpRequestHandler;
    /**
     * The event handler for the `IHttpServer.controller` method.
     */
    onControllerMethodInitialized: ControllerMethodInitializedEventHandler;
}

/**
 * Options for `setupControllersWithSwaggerStats()` function.
 */
export interface ISetupControllersWithSwaggerStatsOptions {
    /**
     * Custom controller options.
     */
    controllerOptions?: Nilable<IControllersOptions>;
    /**
     * Custom options or middleware(s).
     */
    optionsOrMiddlewares?: Nilable<HttpOptionsOrMiddlewares>;
    /**
     * Custom request path.
     *
     * @default "/swagger-stats"
     */
    path?: Nilable<HttpRequestPath>;
}

/**
 * Used to setup an `IHttpServer` instance, to return statistics about its Swagger documentation.
 *
 * @example
 * ```
 * import createServer, { createSwaggerStatSettings } from '@egomobile/http-server'
 *
 * const app = createServer()
 *
 * const {
 *   handler: statsHandler,
 *   onControllerMethodInitialized
 * } = createSwaggerStatSettings()
 *
 * app.controllers({
 *   onControllerMethodInitialized
 * })
 *
 * app.get('/swagger-stats', statsHandler)
 *
 * app.listen()
 *   .catch(console.error)
 * ```
 *
 * @returns {ISetupSwaggerStatsResult} Settings for the `IHttpServer.contoller` method.
 */
export function createSwaggerStatSettings(): ICreateSwaggerStatSettingsResult {
    const allMethods: IControllerMethodInfo[] = [];

    const getTotalMethodCount = () => {
        return allMethods.length;
    };
    const getDocumentedMethodCount = () => {
        return [...allMethods].reduce((prevVal, method) => {
            return prevVal +
                (method.swaggerOperations.length > 0 ? 1 : 0);
        }, 0);
    };

    const onControllerMethodInitialized: ControllerMethodInitializedEventHandler = ({
        methods
    }) => {
        allMethods.push(...methods);
    };

    const handler: HttpRequestHandler = async (request, response) => {
        apiResponse(request, response)
            .withData({
                "totalMethodCount": getTotalMethodCount(),
                "documentedMethodCount": getDocumentedMethodCount()
            })
            .send();
    };

    return {
        handler,
        onControllerMethodInitialized
    };
}

/**
 * Sets up an `IHttpServer` instance, that returns statistics about its Swagger documentation.
 *
 * @example
 * ```
 * import createServer, { setupControllersWithSwaggerStats } from '@egomobile/http-server'
 *
 * const app = createServer()
 *
 * setupControllersWithSwaggerStats(app)
 *
 * app.listen()
 *   .catch(console.error)
 * ```
 *
 * @param {IHttpServer} server The server instance.
 * @param {Nilable<ISetupControllersWithSwaggerStatsOptions>} [options] Custom options.
 *
 * @returns {IControllersResult} The result of the underlying `server.controllers` call.
 */
export function setupControllersWithSwaggerStats(server: IHttpServer, options?: Nilable<ISetupControllersWithSwaggerStatsOptions>): IControllersResult {
    const originalOnControllerMethodInitialized = options?.controllerOptions?.onControllerMethodInitialized;

    const {
        handler,
        onControllerMethodInitialized
    } = createSwaggerStatSettings();

    const result = server.controllers({
        ...(options?.controllerOptions ?? {}),

        "onControllerMethodInitialized": (context) => {
            originalOnControllerMethodInitialized?.(context);

            onControllerMethodInitialized(context);
        }
    });

    server.get(
        options?.path || "/swagger-stats",
        options?.optionsOrMiddlewares || {},
        handler
    );

    return result;
}
