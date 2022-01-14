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

import { ApiResponseBuilder } from '../..';

describe('ApiResponseBuilder.withData', () => {
    it('should save valid value for data result prop', async () => {
        const data: any = {
            foo: 'bar',
            baz: 42
        };

        const obj = new ApiResponseBuilder({ request: {} as any, response: {} as any })
            .withData(data)
            .create();

        // obj.success
        expect(typeof obj).toBe('object');
        expect(typeof obj.success).toBe('boolean');
        expect(obj.success).toBe(true);
        // obj.messages
        expect(typeof obj.messages).toBe('object');
        expect(Array.isArray(obj.messages)).toBe(true);
        expect(obj.messages.length).toBe(0);
        // obj.data
        expect(typeof obj.data).toBe('object');
        expect(obj.data).toStrictEqual(data);
    });
});
