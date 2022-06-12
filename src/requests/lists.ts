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
import joi from "joi";
import { apiResponse } from "..";
import { Nilable } from "../types/internal";
import { getEmptyArray } from "../utils/internal";

/**
 * Valid values for sort directions.
 */
export type ApiListQuerySortDirection = "asc" | "desc";

/**
 * Value type for 'IApiListQuery.sort' prop.
 */
export type ApiListQuerySortProp = Record<string, ApiListQuerySortDirection>;

type GetInvalidFieldNamesPredicate = (sort: ApiListQuerySortProp) => string[];

/**
 * Data for an API list query.
 */
export interface IApiListQuery {
    /**
     * The limit of items per page.
     */
    limit: number;
    /**
     * The zero-based offset.
     */
    offset: number;
    /**
     * List of columns / fields to sort.
     */
    sort: ApiListQuerySortProp;
}

/**
 * Options for 'parseListQuery()' function.
 */
export interface IParseListQueryOptions {
    /**
     * List of one or more valid field names.
     *
     * If not defined, all fields are valid.
     */
    validFieldNames?: Nilable<ValidFieldNameItemValue[]>;
}

/**
 * A valid value for an item of 'IParseListQueryOptions.validFieldNames' prop.
 */
export type ValidFieldNameItemValue = string | RegExp | ValidFieldNamePredicate;

/**
 * A predicate, which checks for a valie field name.
 *
 * @param {string} fieldName The name of the field to check.
 *
 * @returns {boolean} Indicates, if field is valid or not.
 */
export type ValidFieldNamePredicate = (fieldName: string) => boolean;

const listQueryParamsSchema = joi.object({
    "limit": joi.number().strict().min(0).required(),
    "offset": joi.number().strict().min(0).required(),
    "sort": joi.object()
        .pattern(/^/, joi.string().strict().valid("asc", "desc").required())
        .required()
});

/**
 * Creates a new middleware, which parses the values from
 * 'query' prop of request context and extracts the values,
 * which can be used to query through lists / collections.
 *
 * @example
 * ```
 * import assert from 'assert'
 * import createServer, { query } from '@egomobile/http-server'
 * import { parseListQuery } from '@egomobile/api-utils'
 *
 * async function main() {
 *   const app = createServer()
 *
 *   app.get(
 *      '/',
 *      [query(), parseListQuery()],
 *      async (request, response) => {
 *          assert.strictEqual(typeof request.listQuery, 'object')
 *      }
 *   )
 *
 *   await app.listen()
 * }
 *
 * main().catch(console.error)
 * ```
 *
 * @param {IParseListQueryOptions} options Custom options.
 * @param {ValidFieldNameItemValue[]} validFieldNames The list of valid field names.
 *
 * @returns {HttpMiddleware} The new middleware.
 */
export function parseListQuery(): HttpMiddleware;
export function parseListQuery(options: IParseListQueryOptions): HttpMiddleware;
export function parseListQuery(validFieldNames: ValidFieldNameItemValue[]): HttpMiddleware;
export function parseListQuery(optionsOrValidFieldNames?: Nilable<IParseListQueryOptions | ValidFieldNameItemValue[]>): HttpMiddleware {
    let options: Nilable<IParseListQueryOptions>;
    if (optionsOrValidFieldNames) {
        if (Array.isArray(optionsOrValidFieldNames)) {
            options = {
                "validFieldNames": optionsOrValidFieldNames as ValidFieldNameItemValue[]
            };
        }
        else {
            options = optionsOrValidFieldNames as IParseListQueryOptions;
        }
    }

    // check options?.validFieldNames
    // to list of ValidFieldNamePredicate[]
    const validFieldNamesPredicates =
        options?.validFieldNames?.map(toValidFieldNamePredicate);

    const getInvalidFieldNames: GetInvalidFieldNamesPredicate =
        validFieldNamesPredicates?.length ?
            (sort) => {
                return Object.keys(sort)
                    .filter(
                        (fieldName) => {
                            return !validFieldNamesPredicates!.some(predicate => {
                                return predicate(fieldName);
                            });
                        }
                    );
            }
            : getEmptyArray;

    // we do not need these things anymore => cleanup memory
    options = null;
    optionsOrValidFieldNames = null;

    return async (request, response, next) => {
        const listQuery: IApiListQuery = {
            "limit": 0,
            "offset": 0,
            "sort": {}
        };

        if (request.query) {
            listQuery.limit = parseInt(request.query.get("limit") || "0");
            listQuery.offset = parseInt(request.query.get("offset") || "0");

            // extract query params for "walking" through lists
            //
            // example: manufactorer,desc;color;model,asc
            request.query.get("sort")?.split(";")  // separate columns
                .forEach((fieldWithSort: string) => {
                    let fieldName: string;
                    let sortDir: string;

                    const sep = fieldWithSort.indexOf(",");
                    if (sep > -1) {
                        fieldName = fieldWithSort.substring(0, sep);
                        sortDir = fieldWithSort.substring(sep + 1);
                    }
                    else {
                        fieldName = fieldWithSort;
                        sortDir = "asc";
                    }

                    listQuery.sort[fieldName] = sortDir as ApiListQuerySortDirection;
                });
        }

        const validationResult = listQueryParamsSchema.validate(listQuery);
        if (!validationResult.error) {
            const invalidFieldNames = getInvalidFieldNames(listQuery.sort);
            if (!invalidFieldNames.length) {
                request.listQuery = listQuery;

                next();
            }
            else {
                // at least one field is invalid

                const apiResp = apiResponse(request, response)
                    .noSuccess()
                    .withStatus(400);

                invalidFieldNames.forEach((fieldName) => {
                    apiResp.addMessage({
                        "code": 1,
                        "type": "error",
                        "message": `Following list query field is invalid: ${fieldName}`
                    });
                });

                apiResp.send();
            }
        }
        else {
            // invalid format of listQuery

            const apiResp = apiResponse(request, response)
                .noSuccess()
                .addMessage({
                    "code": 2,
                    "type": "error",
                    "message": `List query parameters are invalid: ${validationResult.error.message}`
                })
                .withStatus(400);

            if (validationResult.warning) {
                apiResp.addMessage({
                    "code": 3,
                    "type": "warn",
                    "message": `Warning when parsing list query parameters: ${validationResult.warning.message}`
                });
            }

            apiResp.send();
        }
    };
}

function toValidFieldNamePredicate(value: ValidFieldNameItemValue): ValidFieldNamePredicate {
    if (typeof value === "string") {
        return (fieldName) => {
            return value === fieldName;
        };
    }

    if (value instanceof RegExp) {
        return (fieldName) => {
            return value.test(fieldName);
        };
    }

    return value;
}
