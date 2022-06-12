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

import { ApiResponseBuilder, IApiResponseMessage } from "../..";

describe("ApiResponseBuilder.addMessage", () => {
    it("should save valid value for messages result prop if array", async () => {
        const obj = new ApiResponseBuilder({ "request": {} as any, "response": {} as any })
            .addMessage({
                "message": "foo"
            })
            .create();

        const expectedArray: IApiResponseMessage[] = [{
            "internal": false,
            "type": "info",
            "code": null,
            "id": null,
            "message": "foo"
        }];

        // obj.success
        expect(typeof obj).toBe("object");
        expect(typeof obj.success).toBe("boolean");
        expect(obj.success).toBe(true);
        // obj.messages
        expect(typeof obj.messages).toBe("object");
        expect(Array.isArray(obj.messages)).toBe(true);
        expect(obj.messages.length).toBe(expectedArray.length);
        expect(obj.messages).toStrictEqual(expectedArray);
        // obj.data
        expect(typeof obj.data).toBe("object");
        expect(obj.data).toStrictEqual(null);
    });
});
