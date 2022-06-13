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

import type { IHttpRequest, IHttpResponse } from "@egomobile/http-server";
import type { Nilable } from "../types/internal";
import { ApiResponseBuilder } from "./classes/ApiResponseBuilder";

/**
 * Options for 'apiResponse()' function.
 */
export interface IApiResponseOptions {
    /**
     * Execute 'end()' method of response
     * when invoke 'send()' of ApiResponseBuilder.
     */
    executeEnd?: Nilable<boolean>;
}

/**
 * Creates a new instance, building the data for an API response.
 *
 * @example
 * ```
 * import createServer from '@egomobile/http-server'
 * import { apiResponse } from '@egomobile/api-utils'
 *
 * const app = createServer()
 *
 * app.get('/', async (request, response) => {
 *   // create a new object and write
 *   // it to 'newObject'
 *
 *   apiResponse(request, response)
 *     .withStatus(201)  // set HTTP status code to 201
 *     .withData(newObject)  // set value for 'data' prop
 *     .addMessage('Object has been created')  // a simple 'info' message for the user
 *     .addMessage({
 *       type: 'warn'
 *       internal: true,
 *       message: 'A new object with ID ' + newObject.id + ' has been created'
 *     })  // internal warning message
 *     .send()  // write all data to client
 * })
 *
 * app.listen()
 *   .catch(console.error)
 * ```
 *
 * @param {IHttpRequest} request The response context.
 * @param {IHttpResponse} response The response context.
 * @param {Nilable<IApiResponseOptions>} [options] Custom options.
 *
 * @returns {ApiResponseBuilder} The new instance.
 */
export function apiResponse(request: IHttpRequest, response: IHttpResponse, options?: Nilable<IApiResponseOptions>): ApiResponseBuilder {
    return new ApiResponseBuilder({
        request,
        response,
        "executeEnd": options?.executeEnd
    });
}

export * from "./classes";
export * from "./handlers";
export * from "./swagger";

