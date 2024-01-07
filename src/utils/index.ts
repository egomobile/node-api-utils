/* eslint-disable jsdoc/check-param-names */
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

import type { AxiosResponse } from "axios";
import type { IApiResponseMessage } from "../responses";
import { UnexpectedApiResponseError } from "../types/errors/unexpectedApiResponseError";
import type { Nilable } from "../types/internal";

/**
 * A repository of API error messages by HTTP status code.
 */
export type ApiResponseErrorMessages = Record<string, string>;

/**
 * A function, that validates an API response.
 *
 * @param {IApiResponseValidatorContext} context The context.
 *
 * @returns {ApiResponseValidatorResultValue|PromiseLike<ApiResponseValidatorResultValue>} If explicitly `false`, the function will throw an `UnexpectedApiResponseError`.
 *
 * @throws `UnexpectedApiResponseError`
 */
export type ApiResponseValidator = (context: IApiResponseValidatorContext) => ApiResponseValidatorResultValue | PromiseLike<ApiResponseValidatorResultValue>;

/**
 * A possible result value of a `ApiResponseValidator` call, while explicit  `false` will indicate, that an error has to be thrown.
 */
export type ApiResponseValidatorResultValue = boolean | void;

/**
 * Context for an `ApiResponseValidator`.
 */
export interface IApiResponseValidatorContext {
    /**
     * The underlying response context.
     */
    response: AxiosResponse;
}

/**
 * Throws an exception on an unexpected API response.
 *
 * @example
 * ```
 * import axios from "axios"
 * import { throwOnUnexpectedApiResponse } from "@egomobile/api-utils"
 *
 * const response = await axios.get("https://api.example.com")
 *
 * // we expect `200` as response
 * await throwOnUnexpectedApiResponse(response, 200)
 *
 * // same as an array, which makes it possible to expect more than
 * // one possible status code
 * await throwOnUnexpectedApiResponse(response, [200])
 *
 * // as validator function
 * await throwOnUnexpectedApiResponse(response, (context) => context.response.status === 200)
 *
 * // this will throw special errors messages, for status codes beginning with 4 or 5
 * //
 * // the first match always "wins"
 * //
 * // following template placeholders are supported:
 * // - {{body}} => response body as text with a maximum length of 131072 chars
 * // - {{headers}} => list of HTTP response headers as one single text
 * // - {{statusCode}} => HTTP status code, like 200, 404, 500 etc.
 * // - {{statusText}} => text representation of HTTP status code, like `OK`, `Not Found`, `Internal Server Error` etc.
 * //
 * await throwOnUnexpectedApiResponse(response, 200, {
 *   "^4": "Unexpected client error: {{statusCode}} {{statusText}}\n\n{{body}}",
 *   "^5": "Unexpected server error: {{statusCode}} {{statusText}}\n\n{{body}}"
 * })
 * ```
 *
 * @param {AxiosResponse} response The response context.
 * @param {number} expectedStatusCode One expected HTTP status code.
 * @param {number[]} expectedStatusCodes One or more expected HTTP status codes.
 * @param {ApiResponseValidator} validator The custom validator function.
 * @param {Nilable<ApiResponseErrorMessages>} [errorMessages] An optional repository of error messages by status code.
 *
 * @returns {Promise<void>}
 */
export function throwOnUnexpectedApiResponse(
    response: AxiosResponse, expectedStatusCodes: number[],
    errorMessages?: Nilable<ApiResponseErrorMessages>
): Promise<void>;
export function throwOnUnexpectedApiResponse(
    response: AxiosResponse, expectedStatusCode: number,
    errorMessages?: Nilable<ApiResponseErrorMessages>
): Promise<void>;
export function throwOnUnexpectedApiResponse(
    response: AxiosResponse, validator: ApiResponseValidator,
    errorMessages?: Nilable<ApiResponseErrorMessages>
): Promise<void>;
export async function throwOnUnexpectedApiResponse(
    response: AxiosResponse,
    expectedStatusCodesOrValidator: number | number[] | ApiResponseValidator,
    errorMessages?: Nilable<ApiResponseErrorMessages>
) {
    const maxStringDataLength = 131072;
    const statusErrors = errorMessages ?? {};

    let validator: ApiResponseValidator;
    if (typeof expectedStatusCodesOrValidator === "function") {
        // validator function
        validator = expectedStatusCodesOrValidator as ApiResponseValidator;
    }
    else if (typeof expectedStatusCodesOrValidator === "number") {
        // single number
        const expectedStatusCode = expectedStatusCodesOrValidator as number;

        validator = async ({ response }) => {
            return response.status === expectedStatusCode;
        };
    }
    else {
        // number[]
        const expectedStatusCodes = [...expectedStatusCodesOrValidator];

        validator = async ({ response }) => {
            return expectedStatusCodes.includes(response.status);
        };
    }

    const isResponseValid = await validator({ response });
    if (isResponseValid !== false) {
        return;
    }

    // build and throw error ...

    const strStatus = String(response.status);

    let strHeaders = "";
    if (response.headers) {
        strHeaders = Object.entries(response.headers)
            .map(([headerName, headerValue]) => {
                return `${headerName}: ${headerValue}`;
            })
            .join("\n");
    }

    let strData = "";
    const messages: Nilable<Partial<IApiResponseMessage>>[] = [];
    try {
        if (response.data) {
            if (typeof response.data === "string") {
                strData = response.data;
            }
            else if (typeof response.data === "object") {
                if (
                    "success" in response.data &&
                    "data" in response.data &&
                    "messages" in response.data && Array.isArray(response.data.messages)
                ) {
                    // seems to be an object of type `IApiResponse`

                    messages.push(
                        ...response.data.messages
                    );
                }

                strData = JSON.stringify(response.data);
            }
        }
        else {
            strData = String(response.data);
        }
    }
    catch {
        // ignore errors
    }

    if (strData.length >= maxStringDataLength) {
        strData = strData.substring(0, maxStringDataLength - 1) + "…";
    }

    let errorMessage: string;

    const firstMatchingStatusErrorMessage = Object.entries(statusErrors).filter(([statusCodeRegex]) => {
        const rx = new RegExp(statusCodeRegex, "im");

        return rx.test(strStatus);
    }).map(([, errorMessage]) => {
        return errorMessage;
    })[0];
    if (firstMatchingStatusErrorMessage) {
        errorMessage = firstMatchingStatusErrorMessage;

        // replace template placeholders
        errorMessage = errorMessage.split("{{statusCode}}").join(String(response.status));
        errorMessage = errorMessage.split("{{statusText}}").join(response.statusText);
        errorMessage = errorMessage.split("{{headers}}").join(strHeaders);
        errorMessage = errorMessage.split("{{body}}").join(strData);
    }
    else {
        let suffix: string;
        if (messages.length > 0) {
            suffix = messages.map((msg) => {
                const codePrefix = typeof msg?.code === "number" ? `${msg.code} :: ` : "";
                const messageText = String(msg?.message || "").trim();
                const typePrefix = msg?.type ? `[${msg?.type}] ` : "";

                return `- ${codePrefix}${typePrefix}${messageText}`;
            }).join("\n");
        }
        else {
            suffix = `${strHeaders}\n\n${strData}`;
        }

        errorMessage = `Unexpected response: ${response.status} ${response.statusText}\n\n${suffix}`;
    }

    throw new UnexpectedApiResponseError(response, errorMessage);
}
