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

import type { OpenAPIV3 } from '@egomobile/http-server';
import type { Nilable } from '../../types/internal';

/**
 * Options for 'createSwaggerSchemaOfApiResponse()' function.
 */
export interface ICreateSwaggerSchemaForApiResponseOptions {
    /**
     * The schema for the data property.
     */
    dataSchema?: Nilable<OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject>;
}

/**
 * Creates a Swagger schema, which describes a standard API response
 * with custom data schema.
 *
 * @example
 * ```
 * import { Controller, ControllerBase, GET, IHttpRequest, IHttpResponse } from '@egomobile/http-server'
 * import { createSwaggerSchemaForApiResponse } from '@egomobile/api-utils'
 *
 * @Controller()
 * export default class IndexController extends ControllerBase {
 *   @GET({
 *     path: '/',
 *     documentation: {
 *       summary: 'This is a description of that endpoint',
 *       responses: {
 *         '200': {
 *           description: 'Operation was successful.',
 *           content: {
 *             'application/json': {
 *               schema: createApiResponseSwaggerSchema({
 *                 dataSchema: {
 *                   type: 'object',
 *                   properties: {
 *                     // ...
 *                   }
 *                 }
 *               })
 *             }
 *           }
 *         }
 *       }
 *     }
 *   })
 *   async index(request: IHttpRequest, response: IHttpResponse) {
 *     // ...
 *   }
 * }
 * ```
 *
 * @param {ICreateSwaggerSchemaForApiResponseOptions} options Custom options.
 *
 * @returns {OpenAPIV3.SchemaObject} The new schema.
 */
export function createSwaggerSchemaForApiResponse(options?: Nilable<ICreateSwaggerSchemaForApiResponseOptions>): OpenAPIV3.SchemaObject {
    return {
        type: 'object',
        required: ['success', 'data', 'messages'],
        properties: {
            success: {
                type: 'boolean',
                description: 'Indicates if operation was successful or not.',
                example: true
            },
            data: options?.dataSchema || {
                type: 'object',
                nullable: true,
                example: null
            },
            messages: {
                type: 'array',
                items: {
                    type: 'object',
                    required: ['code', 'id', 'internal', 'message', 'type'],
                    properties: {
                        code: {
                            type: 'integer',
                            description: 'A optional code, which describes the field.',
                            nullable: true,
                            example: 40000
                        },
                        id: {
                            type: 'string',
                            description: 'An optional ID, which describes the message.',
                            nullable: true,
                            example: '8098f705-8e84-45f8-8bdb-78955a829363'
                        },
                        internal: {
                            type: 'string',
                            description: 'An optional ID, which describes the message.',
                            default: false,
                            example: true
                        },
                        message: {
                            type: 'string',
                            description: 'The message text',
                            example: 'Gallia est omnis divisa in partes tres, quarum unam incolunt Belgae, aliam Aquitani, tertiam, qui ipsorum lingua Celtae, nostra Galli appellantur.'
                        },
                        type: {
                            type: 'string',
                            description: 'The type of the message.',
                            default: 'info',
                            enum: ['error', 'info', 'warn']
                        }
                    }
                }
            }
        }
    };
}
