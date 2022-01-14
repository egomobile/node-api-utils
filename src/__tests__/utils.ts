import { Response } from 'supertest';

export function binaryParser(response: Response, callback: (err: any, data?: Buffer) => any) {
    response.setEncoding('binary');

    let data = '';

    response.once('error', (error: any) => {
        callback(error);
    });

    response.on('data', (chunk: string) => {
        data += chunk;
    });

    response.once('end', () => {
        callback(null, Buffer.from(data, 'binary'));
    });
}
