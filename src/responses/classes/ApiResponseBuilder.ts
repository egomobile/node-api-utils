/* eslint-disable no-underscore-dangle */
/* eslint-disable unicorn/filename-case */

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

import type { IHttpRequest, IHttpResponse } from '@egomobile/http-server';
import { List, Nilable, Nullable } from '../../types/internal';
import { isIterable, isNil } from '../../utils/internal';

/**
 * Format of response data.
 */
export type ApiResponseData = Record<string, any>;

/**
 * Type of a API response message.
 */
export type ApiResponseMessageType = 'error' | 'info' | 'warn';

/**
 * Options for adding a message to a response.
 */
export interface IAddApiResponseMessageOptions {
    /**
     * A human-readble error code.
     */
    code?: Nilable<number>;
    /**
     * The unique ID of an entry in a database, e.g.
     */
    id?: Nilable<string>;
    /**
     * Indicates if it an internal message or
     * a message, which can be read be an user.
     */
    internal?: boolean;
    /**
     * The message text.
     */
    message: string;
    /**
     * The type. Default: 'info'
     */
    type?: Nilable<ApiResponseMessageType>;
}

/**
 * An API response.
 */
export interface IApiResponse {
    /**
     * The data to send.
     */
    data: Nullable<ApiResponseData>;
    /**
     * List of messages.
     */
    messages: IApiResponseMessage[];
    /**
     * Indicates if operation was successful or not.
     */
    success: boolean;
}

/**
 * Options for 'ApiResponseBuilder' class.
 */
export interface IApiResponseBuilderOptions {
    /**
     * The underlying request context.
     */
    request: IHttpRequest;
    /**
     * The underlying response context.
     */
    response: IHttpResponse;
}

/**
 * An API response message.
 */
export interface IApiResponseMessage {
    /**
     * A human-readble error code.
     */
    code: Nullable<number>;
    /**
     * The unique ID of an entry in a database, e.g.
     */
    id: Nullable<string>;
    /**
     * Indicates if it an internal message or
     * a message, which can be read be an user.
     */
    internal: boolean;
    /**
     * The message text.
     */
    message: string;
    /**
     * The type. Default: 'info'
     */
    type: ApiResponseMessageType;
}

/**
 * Options for 'ApiResponseBuilder.withList()' method.
 */
export interface IWithApiResponseListOptions<T extends any = any> {
    /**
     * The entries per page.
     */
    limit?: Nilable<number>;
    /**
     * The zero-based offset.
     */
    offset?: Nilable<number>;
    /**
     * The list of items.
     */
    items: List<T>;
    /**
     * The total number of possible items.
     */
    totalCount?: Nilable<number>;
}

/**
 * Util class for handling API responses.
 *
 * @example
 * ```
 * import createServer from '@egomobile/http-server'
 * import { ApiResponseBuilder } from '@egomobile/api-utils'
 *
 * const app = createServer()
 *
 * app.get('/', async (request, response) => {
 *   new ApiResponseBuilder({ request, response })
 *     .send()  // send a simple 200 message
 * })
 *
 * app.listen()
 *   .catch(console.error)
 * ```
 */
export class ApiResponseBuilder {
    private _data: Nullable<ApiResponseData> = null;
    private readonly _messages: IApiResponseMessage[] = [];
    private _status = 200;
    private _success = true;

    /**
     * Initializes a new instance of that class.
     *
     * @param {IApiResponseBuilderOptions} options The options.
     */
    public constructor(options: IApiResponseBuilderOptions) {
        this.request = options.request;
        this.response = options.response;
    }

    /**
     * Adds a message.
     *
     * @param {string} message The message.
     * @param {IAddApiResponseMessageOptions} options The options.
     *
     * @returns {this} That instance.
     */
    public addMessage(message: string): this;
    public addMessage(options: IAddApiResponseMessageOptions): this;
    public addMessage(optionsOrMessage: IAddApiResponseMessageOptions | string): this {
        let options: IAddApiResponseMessageOptions;
        if (typeof optionsOrMessage === 'object') {
            options = optionsOrMessage;
        } else {
            options = {
                message: optionsOrMessage
            };
        }

        this._messages.push({
            code: options.code || null,
            id: options.id || null,
            internal: !!options.internal,
            message: options.message,
            type: options.type || 'info'
        });

        return this;
    }

    /**
     * Creates a new API response object.
     *
     * @returns {IApiResponse} The new object.
     */
    public create(): IApiResponse {
        return {
            success: this._success,
            data: this._data,
            messages: this._messages
        };
    }

    /**
     * Sets the value for 'success' result prop to '(false)'.
     *
     * @returns {this} That instance.
     */
    public noSuccess(): this {
        this._success = false;

        return this;
    }

    /**
     * The underlying request context.
     */
    public readonly request: IHttpRequest;

    /**
     * The underlying response context.
     */
    public readonly response: IHttpResponse;

    /**
     * Creates and sends an API response, based of the current object
     * of that instance.
     */
    public send(): void {
        const jsonData = Buffer.from(
            JSON.stringify(this.create()), 'utf-8'
        );

        if (!this.response.headersSent) {
            this.response.writeHead(this._status, {
                'Content-Type': 'application/json; charset=UTF-8',
                'Content-Length': String(jsonData.length)
            });
        }

        this.response.write(jsonData);
    }

    /**
     * Sets the value for the data property.
     *
     * @param {Nilable<ApiResponseData>} data The new value.
     *
     * @returns {this} That instance.
     */
    public withData(data: Nilable<ApiResponseData>): this {
        this._data = data || null;

        return this;
    }

    /**
     * Sets the value for the data property as list response.
     *
     * @param {IWithApiResponseListOptions} options The options.
     *
     * @returns {this} That instance.
     */
    public withList(items: List): this;
    public withList(options: IWithApiResponseListOptions): this;
    public withList(optionsOrItems: IWithApiResponseListOptions | List): this {
        let options: IWithApiResponseListOptions;
        if (isIterable(optionsOrItems)) {
            options = {
                items: optionsOrItems as List
            };
        } else {
            options = optionsOrItems as IWithApiResponseListOptions;
        }

        const items = Array.isArray(options.items) ?
            options.items : [...options.items];

        this._data = {
            offset: isNil(options.offset) ? 0 : options.offset,
            totalCount: isNil(options.totalCount) ? items.length : options.totalCount,
            limit: isNil(options.limit) ? items.length : options.limit,
            items
        } as any;

        return this;
    }

    /**
     * Sets the response HTTP status code.
     *
     * @param {number} code The new value.
     *
     * @returns {this} That instance.
     */
    public withStatus(code: number): this {
        this._status = code;

        return this;
    }
}
