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

import { ApiResponseBuilder } from "../..";

describe("ApiResponseBuilder.withStatus", () => {
    it("should save valid status code to internal prop", async () => {
        for (let i = 200; i < 600; i++) {
            const response = new ApiResponseBuilder({ "request": {} as any, "response": {} as any })
                .withStatus(i);

            // eslint-disable-next-line no-underscore-dangle
            const value: any = (response as any)._status;

            expect(typeof value).toBe("number");
            expect(value).toBe(i);
        }
    });
});
