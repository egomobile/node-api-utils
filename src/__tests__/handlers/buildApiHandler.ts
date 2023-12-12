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

import axios from "axios";
import type { IncomingMessage, ServerResponse } from "node:http";
import { IApiHandler, createApiHandlerFactory } from "../../handlers/apis";

const createApiHandler = createApiHandlerFactory({
    "getApiClient": () => {
        // this is dummy and
        // will not be used here
        return Promise.resolve(axios.create());
    },

    "methods": {
        "handleApi1": async function (this: IApiHandler) {
            const {
                request,
                response
            } = this;

            expect((request as any).testRequest).toBe("A");
            expect((response as any).testRequest).toBe("B");

            (request as any).testResponse = 1;
            (response as any).testResponse = 22;
        },

        "handleApi2": async function (this: IApiHandler) {
            const {
                request,
                response
            } = this;

            expect((request as any).testRequest).toBe("C");
            expect((response as any).testRequest).toBe("D");

            (request as any).testResponse = 333;
            (response as any).testResponse = 4444;
        }
    }
});

describe("apiHandlerBuilder()", () => {
    it("should fill request+response with 1 and 22 if handleApi1() is executed", async () => {
        const request = {
            "testRequest": "A"
        } as unknown as (IncomingMessage & {
            testRequest: unknown;
            testResponse: unknown;
        });
        const response = {
            "testRequest": "B"
        } as unknown as (ServerResponse & {
            testRequest: unknown;
            testResponse: unknown;
        });

        const newHandler = createApiHandler({
            request, response
        });

        await newHandler.handleApi1();

        expect(request.testResponse).toBe(1);
        expect(response.testResponse).toBe(22);
    });

    it("should fill request+response objects with 333 and 4444 if handleApi2() is executed", async () => {
        const request = {
            "testRequest": "C"
        } as unknown as (IncomingMessage & {
            testRequest: unknown;
            testResponse: unknown;
        });
        const response = {
            "testRequest": "D"
        } as unknown as (ServerResponse & {
            testRequest: unknown;
            testResponse: unknown;
        });

        const newHandler = createApiHandler({
            request, response
        });

        await newHandler.handleApi2();

        expect(request.testResponse).toBe(333);
        expect(response.testResponse).toBe(4444);
    });
});
