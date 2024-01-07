import createServer from "@egomobile/http-server";
import type { AxiosResponse } from "axios";
import assert from "node:assert";
import request from "supertest";
import { apiResponse } from "../../responses";
import { UnexpectedApiResponseError } from "../../types";
import { ApiResponseValidator, throwOnUnexpectedApiResponse } from "../../utils";
import { binaryParser } from "../_utils";

const NO_ERROR = Symbol("NO_ERROR");

describe("throwOnUnexpectedApiResponse()", () => {
    it("should throw UnexpectedApiResponseError using single status code", async () => {
        const app = createServer();

        app.get("/", async (request, response) => {
            apiResponse(request, response)
                .noSuccess()
                .withStatus(400)
                .addMessage({
                    "code": 40000,
                    "message": "Invalid input data"
                })
                .send();
        });

        const response = await request(app).get("/")
            .send()
            .parse(binaryParser);

        const data = response.body;
        expect(Buffer.isBuffer(data)).toBe(true);

        const dataObj = JSON.parse(
            data.toString("utf8")
        );

        const axiosResponse = {
            "config": undefined!,
            "data": dataObj,
            "headers": response.headers,
            "status": response.statusCode,
            "statusText": response.text
        } as AxiosResponse;

        let lastError: any = NO_ERROR;

        try {
            await throwOnUnexpectedApiResponse(axiosResponse, 200);
        }
        catch (error) {
            lastError = error;
        }

        assert.strictEqual(typeof lastError, "object");
        assert.strictEqual(lastError instanceof UnexpectedApiResponseError, true);
    });

    it("should throw UnexpectedApiResponseError using list of status codes", async () => {
        const app = createServer();

        app.get("/", async (request, response) => {
            apiResponse(request, response)
                .noSuccess()
                .withStatus(400)
                .addMessage({
                    "code": 40000,
                    "message": "Invalid input data"
                })
                .send();
        });

        const response = await request(app).get("/")
            .send()
            .parse(binaryParser);

        const data = response.body;
        expect(Buffer.isBuffer(data)).toBe(true);

        const dataObj = JSON.parse(
            data.toString("utf8")
        );

        const axiosResponse = {
            "config": undefined!,
            "data": dataObj,
            "headers": response.headers,
            "status": response.statusCode,
            "statusText": response.text
        } as AxiosResponse;

        let lastError: any = NO_ERROR;

        try {
            await throwOnUnexpectedApiResponse(axiosResponse, [200, 201]);
        }
        catch (error) {
            lastError = error;
        }

        assert.strictEqual(lastError instanceof UnexpectedApiResponseError, true);
    });

    it("should throw UnexpectedApiResponseError using validation functions", async () => {
        const app = createServer();

        app.get("/", async (request, response) => {
            apiResponse(request, response)
                .noSuccess()
                .withStatus(400)
                .addMessage({
                    "code": 40000,
                    "message": "Invalid input data"
                })
                .send();
        });

        const response = await request(app).get("/")
            .send()
            .parse(binaryParser);

        const data = response.body;
        expect(Buffer.isBuffer(data)).toBe(true);

        const dataObj = JSON.parse(
            data.toString("utf8")
        );

        const axiosResponse = {
            "config": undefined!,
            "data": dataObj,
            "headers": response.headers,
            "status": response.statusCode,
            "statusText": response.text
        } as AxiosResponse;

        const validatorFunctions: ApiResponseValidator[] = [
            (context) => {
                return context.response.status === 200;
            },
            async (context) => {
                return context.response.status === 200;
            }
        ];

        for (const validator of validatorFunctions) {
            let lastError: any = NO_ERROR;

            try {
                await throwOnUnexpectedApiResponse(axiosResponse, validator);
            }
            catch (error) {
                lastError = error;
            }

            assert.strictEqual(lastError instanceof UnexpectedApiResponseError, true);
        }
    });
});
