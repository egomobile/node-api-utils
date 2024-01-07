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

import createServer, { json } from "@egomobile/http-server";
import request from "supertest";
import { handleApiParseError } from "../../responses/handlers";
import { binaryParser } from "../_utils";

describe("handleApiParseError()", () => {
    it("should return 400 if submit invalid JSON data", async () => {
        const expectedResponse: any = {
            "success": false,
            "data": null,
            "messages": [
                {
                    "code": 400,
                    "id": null,
                    "internal": true,
                    "type": "error"
                }
            ]
        };

        const app = createServer();

        app.post(
            "/",
            [
                json({ "onParsingFailed": handleApiParseError() })
            ],
            async (request, response) => {
                response.write("OK: " + JSON.stringify(request.body!));
            });

        const response = await request(app).post("/")
            .send("{ \"invalid JSON data  : ,")
            .parse(binaryParser)
            .expect(400);

        const data = response.body;
        expect(Buffer.isBuffer(data)).toBe(true);

        const obj = JSON.parse(
            data.toString("utf8")
        );

        expectedResponse.messages[0].message = obj.messages[0].message;

        // obj
        expect(typeof obj).toBe("object");
        expect(obj).toStrictEqual(expectedResponse);
    });
});
