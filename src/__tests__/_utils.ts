import type { Response } from "supertest";

export function binaryParser(response: Response, done: (ex: any, data?: Buffer) => any) {
    response.setEncoding("binary");

    let data = "";

    response.once("error", (error: any) => {
        done(error);
    });

    response.on("data", (chunk: string) => {
        data += chunk;
    });

    response.once("end", () => {
        done(null, Buffer.from(data, "binary"));
    });
}
