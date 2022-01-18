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

import createServer from '@egomobile/http-server';
import request from 'supertest';
import { extendRequest } from '../..';
import { binaryParser } from '../utils';

describe('extendRequest()', () => {
    it('should fill request props with valid data', async () => {
        const expextedResponse = 'truestring';

        const app = createServer();

        app.use(extendRequest());

        app.get('/', async (request, response) => {
            response.write(String(request.requestTime instanceof Date));
            response.write(String(typeof request.requestId));
        });

        const response = await request(app).get('/')
            .send()
            .parse(binaryParser)
            .expect(200);

        const data: Buffer = response.body;
        expect(Buffer.isBuffer(data)).toBe(true);

        const str: string = data.toString('utf8');

        expect(str).toBe(expextedResponse);
    });
});
