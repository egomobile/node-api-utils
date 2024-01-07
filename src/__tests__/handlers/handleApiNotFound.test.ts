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

import createServer from "@egomobile/http-server";
import request from "supertest";
import { handleApiNotFound } from "../../responses/handlers";
import { binaryParser } from "../_utils";

describe("handleApiNotFound()", () => {
    it.each(["foo", "bar", "baz"])("should save valid value to internal prop", async (subPath) => {
        const expectedResponse: any = {
            "success": false,
            "data": null,
            "messages": [
                {
                    "code": 404,
                    "id": null,
                    "internal": true,
                    "message": `[GET] URL /${subPath} does not exist`,
                    "type": "error"
                }
            ]
        };

        const app = createServer();

        app.setNotFoundHandler(handleApiNotFound());

        app.get("/", async () => {
            throw new Error("oops!");
        });

        const response = await request(app).get("/" + subPath)
            .send()
            .parse(binaryParser)
            .expect(404);

        const data = response.body;
        expect(Buffer.isBuffer(data)).toBe(true);

        const obj = JSON.parse(
            data.toString("utf8")
        );

        // obj
        expect(typeof obj).toBe("object");
        expect(obj).toStrictEqual(expectedResponse);
    });
});
