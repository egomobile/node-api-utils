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

/**
 * Is thrown on an unexpected API response.
 */
export class UnexpectedApiResponseError extends Error {
    /**
     * Initializes a new instance of that class.
     *
     * @param {AxiosResponse} response The response context.
     * @param {string} [message] The optional message.
     */
    public constructor(
        public readonly response: AxiosResponse,
        message?: string,
    ) {
        super(message);
    }
}
