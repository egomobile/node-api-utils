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

import type { HttpMiddleware } from "@egomobile/http-server";
import crypto from "crypto";

/**
 * Creates a middleware, which extends an IHttpRequest with
 * the props 'requestTime' and 'requestId'.
 *
 * @example
 * ```
 * import createServer from '@egomobile/http-server'
 * import { extendRequest } from '@egomobile/api-utils'
 *
 * const app = createServer()
 *
 * // this should be done very first
 * app.use( extendRequest() )
 *
 * app.get('/', async (request, response) => {
 *   // now we can access the following props:
 *   // - request.requestId
 *   // - request.requestTime
 * })
 *
 * // ...
 *
 * app.listen()
 *   .catch(console.error);
 * ```
 *
 * @returns {HttpMiddleware} The new middleware.
 */
export function extendRequest(): HttpMiddleware {
    return async (request, response, next) => {
        request.requestTime = new Date();
        request.requestId = crypto.randomBytes(16).toString("hex");

        next();
    };
}

export * from "./lists";
