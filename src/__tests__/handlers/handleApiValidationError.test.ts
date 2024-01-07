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

import createServer, { json, schema, validate } from "@egomobile/http-server";
import request from "supertest";
import { handleApiValidationError } from "../../responses/handlers";
import { binaryParser } from "../_utils";

const testSchema = schema.object({
    "email": schema.string().strict().email().required(),
    "name": schema.string().strict().trim().min(1).optional()
});

const validData = [{
    "email": "marcel.kloubert@e-go-mobile.com"
}, {
    "email": "marcel.kloubert@e-go-mobile.com",
    "name": "Marcel Kloubert"
}];

const invalidData = [{}, {
    "email": "foo"
}, {
    "email": "foo",
    "name": "Bar Baz"
}, {
    "email": "foo",
    "name": " Bar Baz"
}, {
    "name": "Marcel Kloubert"
}];

describe("handleApiValidationError()", () => {
    it.each(validData)("should return 200 if submit valid data", async (vd) => {
        const app = createServer();

        app.post(
            "/",
            [json(), validate(testSchema, handleApiValidationError())],
            async () => { });

        await request(app).post("/")
            .send(JSON.stringify(vd))
            .parse(binaryParser)
            .expect(200);
    });

    it.each(invalidData)("should return 200 if submit valid data", async (ivd) => {
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
            [json(), validate(testSchema, handleApiValidationError())],
            async () => { });

        const response = await request(app).post("/")
            .send(JSON.stringify(ivd))
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
