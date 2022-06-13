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

import type { HttpErrorHandler, HttpNotFoundHandler, ValidationFailedHandler } from "@egomobile/http-server";
import { apiResponse } from "..";

/**
 * Creates a new handler for 404 errors.
 *
 * @example
 * ```
 * import createServer from '@egomobile/http-server'
 * import { handleApiError } from '@egomobile/api-utils'
 *
 * const app = createServer()
 *
 * app.setErrorHandler( handleApiError() )
 *
 * // ...
 *
 * app.listen()
 *   .catch(console.error)
 * ```
 *
 * @returns {HttpErrorHandler} The new handler.
 */
export function handleApiError(): HttpErrorHandler {
    return async (error, request, response) => {
        apiResponse(request, response)
            .noSuccess()
            .addMessage({
                "code": 500,
                "type": "error",
                "internal": false,
                "message": "Unexpected server error"
            })
            .addMessage({
                "code": 500,
                "type": "error",
                "internal": true,
                "message": `Unexpected server error: ${String(error)}`
            })
            .withStatus(500)
            .send();
    };
}

/**
 * Creates a new handler for 404 errors.
 *
 * @example
 * ```
 * import createServer from '@egomobile/http-server'
 * import { handleApiNotFound } from '@egomobile/api-utils'
 *
 * const app = createServer()
 *
 * app.setNotFoundHandler( handleApiNotFound() )
 *
 * // ...
 *
 * app.listen()
 *   .catch(console.error)
 * ```
 *
 * @returns {HttpNotFoundHandler} The new handler.
 */
export function handleApiNotFound(): HttpNotFoundHandler {
    return async (request, response) => {
        apiResponse(request, response)
            .noSuccess()
            .addMessage({
                "code": 404,
                "type": "error",
                "internal": true,
                "message": `[${request.method}] URL ${request.url} does not exist`
            })
            .withStatus(404)
            .send();
    };
}

/**
 * Creates a new handler, that handles failed input data validation,
 * check by a schema.
 *
 * @example
 * ```
 * import createServer, { json, schema, validate } from '@egomobile/http-server'
 * import { handleApiValidationError } from '@egomobile/api-utils'
 *
 * interface IMySchema {
 *   // ...
 * }
 *
 * const app = createServer()
 *
 * const mySchema = schema.object({
 *   // ...
 * })
 *
 * const mySchemaErrorHandler = handleApiValidationError()
 *
 * app.post(
 *   '/',
 *   [json(), validate(mySchema, mySchemaErrorHandler)],
 *   async (request, response) => {
 *     const body = request.body as IMySchema;
 *
 *     // ...
 *   }
 * )
 *
 * // ...
 *
 * app.listen()
 *   .catch(console.error)
 * ```
 *
 * @returns {HttpNotFoundHandler} The new handler.
 */
export function handleApiValidationError(): ValidationFailedHandler {
    return async (error, request, response) => {
        apiResponse(request, response)
            .noSuccess()
            .withStatus(400)
            .addMessage({
                "message": error.message,
                "code": 400,
                "type": "error",
                "internal": true
            })
            .send();
    };
}
