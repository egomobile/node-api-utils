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

import createServer, { query } from "@egomobile/http-server";
import request from "supertest";
import { parseListQuery } from "../..";
import { binaryParser } from "../_utils";

const validParams = [
    {},
    {
        "limit": 1
    },
    {
        "limit": 1,
        "offset": 2
    },
    {
        "limit": 3,
        "sort": "foo;bar,desc;baz,asc"
    },
    {
        "limit": 3,
        "offset": 4,
        "sort": "foo;bar,asc;baz,asc"
    },
    {
        "offset": 0
    },
    {
        "offset": 5,
        "sort": "foo;bar,desc;baz,asc"
    },
    {
        "sort": "foo,desc;bar;baz,asc"
    }
];

const invalidParams = [
    {
        "limit": "foo"
    },
    {
        "limit": -1
    },
    {
        "limit": 1,
        "offset": -2
    },
    {
        "limit": 3,
        "sort": "foo,test;bar,desc;baz,asc"
    }
];

describe("parseListQuery()", () => {
    it.each(validParams)("should return 200, if submit valid query params", async (params) => {
        const q = Object.entries(params)
            .map((entry) => {
                return String(entry[0]) + "=" + String(encodeURIComponent(entry[1]));
            })
            .join("&");

        const app = createServer();

        app.get("/", [query(), parseListQuery()], async (request, response) => {
            response.write(
                Buffer.from(JSON.stringify(request.listQuery), "utf8")
            );
        });

        await request(app).get("/?" + q)
            .send()
            .parse(binaryParser)
            .expect(200);
    });

    it.each(invalidParams)("should return 400, if submit invalid query params", async (params) => {
        const q = Object.entries(params)
            .map((entry) => {
                return String(entry[0]) + "=" + String(encodeURIComponent(entry[1]));
            })
            .join("&");

        const app = createServer();

        app.get("/", [query(), parseListQuery()], async (request, response) => {
            response.write(JSON.stringify(request.listQuery));
        });

        await request(app).get("/?" + q)
            .send()
            .parse(binaryParser)
            .expect(400);
    });
});
